const express = require('express');
const cors = require('cors');
const kafka = require('./kafka');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// 1. connect to mongoDB
// check 'user-db' same file in docker-compose
mongoose.connect('mongodb://user-db:27017/users')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// 2. (User Schema)
const UserSchema = new mongoose.Schema({ 
    email: { type: String, required: true }, 
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    phoneNumber: String,
    role: { type: String, default: 'Participant' },
    organizationName: String
});

const User = mongoose.model('User', UserSchema);

// 3. Kafka Producer with retry logic
const producer = kafka.producer();

async function startKafka() {
  let retries = 10;
  while (retries > 0) {
    try {
      await producer.connect();
      console.log('Kafka Producer connected');
      return;
    } catch (err) {
      retries--;
      console.log(`Kafka not ready, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

startKafka();

// Helper function to send events with auto-reconnect logic
async function sendKafkaEvent(topic, data) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }],
    });
  } catch (err) {
    // If disconnected, try to reconnect and send again
    try {
      await producer.connect();
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(data) }],
      });
    } catch (e) {
      console.error('Kafka send failed:', e.message);
    }
  }
}

// 4. Registration Endpoint 

app.post('/User/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role, organizationName } = req.body;

    // check email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // check if exist
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // save new user
    const newUser = await User.create({ 
        email, 
        password, 
        firstName, 
        lastName, 
        phoneNumber, 
        role, 
        organizationName 
    });

    /**
     * SECURITY FIX & Event Data: 
     */
    const userEvent = { 
      id: newUser._id, 
      email: newUser.email,
      role: newUser.role,
      fullName: `${firstName} ${lastName}`
    };

    // send Event to Kafka using the new helper function
    await sendKafkaEvent('UserRegistered', userEvent);

    res.json({ 
        message: 'Success: User registered successfully', 
        userId: newUser._id 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Login Endpoint 

app.post('/User/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // searching for a user by email and password
    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({ 
      message: 'Login successful',
      user: { 
          userId: user._id,
          email: user.email, 
          fullName: `${user.firstName} ${user.lastName}` || email,
          role: user.role 
      },
      token: 'token-' + user._id 
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => console.log('User Service running on internal port 3000'));