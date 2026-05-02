// notification-service/index.js
const express  = require('express');
const mongoose = require('mongoose');
const kafka    = require('./kafka');

const app = express();
app.use(express.json());

/* ── CORS ── */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/* ── MongoDB ── */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://notification-db:27017/notifications';
mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connected'));

/* ── connect to user-db get email from userId ── */
const userDb = mongoose.createConnection('mongodb://user-db:27017/users');
const User   = userDb.model('User',
  new mongoose.Schema({ email: String, _id: mongoose.Schema.Types.ObjectId }),
  'users'
);

/* ── Notification Schema ── */
const notificationSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  userEmail: { type: String },
  type:      { type: String, default: 'Information' },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },
  relatedId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});
const Notification = mongoose.model('Notification', notificationSchema);


async function extractUserInfo(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return {};

  const raw = auth.replace('Bearer ', '').trim();

  /*  token-{mongoId}  */
  if (raw.startsWith('token-')) {
    const userId = raw.replace('token-', '');
    try {
      const userDoc = await User.findById(userId).lean();
      return {
        userId,
        userEmail: userDoc?.email || null,
      };
    } catch {
      return { userId, userEmail: null };
    }
  }

  /* 2 JWT */
  try {
    const payload = JSON.parse(
      Buffer.from(raw.split('.')[1], 'base64').toString()
    );
    const email  = payload.email || payload.sub || null;
    const userId = payload.userId || payload.id  || payload._id || null;

    if (userId) return { userId, userEmail: email };

    if (email) {
      const userDoc = await User.findOne({ email }).lean();
      return {
        userId:    userDoc ? userDoc._id.toString() : email,
        userEmail: email,
      };
    }
  } catch {}

  return {};
}



/* GET /notifications/my */
app.get('/notifications/my', async (req, res) => {
  try {
    const { userId, userEmail } = await extractUserInfo(req);
    console.log(`[GET /notifications/my] userId: ${userId}, email: ${userEmail}`);

    if (!userId && !userEmail) return res.status(401).json({ error: 'Unauthorized' });

    const orConditions = [];
    if (userId)    orConditions.push({ userId });
    if (userEmail) orConditions.push({ userEmail });

    const notifications = await Notification.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`[GET /notifications/my] Found: ${notifications.length} notifications`);

    res.json(notifications.map((n) => ({
      id:        n._id,
      userId:    n.userId,
      type:      n.type,
      title:     n.title,
      message:   n.message,
      isRead:    n.isRead,
      relatedId: n.relatedId,
      createdAt: n.createdAt,
    })));
  } catch (err) {
    console.error('[GET /notifications/my] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* PATCH /notifications/:id/read */
app.patch('/notifications/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PATCH /notifications/read-all */
app.patch('/notifications/read-all', async (req, res) => {
  try {
    const { userId, userEmail } = await extractUserInfo(req);
    if (!userId && !userEmail) return res.status(401).json({ error: 'Unauthorized' });

    const orConditions = [];
    if (userId)    orConditions.push({ userId });
    if (userEmail) orConditions.push({ userEmail });

    await Notification.updateMany(
      { $or: orConditions, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 
   Kafka Consumers
 */
async function startConsumer() {
  const consumer = kafka.consumer({ groupId: 'notification-group' });

  let retries = 10;
  while (retries > 0) {
    try {
      await consumer.connect();
      console.log('[Kafka] Consumer connected');
      break;
    } catch (err) {
      retries--;
      console.log(`[Kafka] Not ready, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  await consumer.subscribe({ topic: 'TicketBooked',    fromBeginning: false });
  await consumer.subscribe({ topic: 'TicketCancelled', fromBeginning: false });
  await consumer.subscribe({ topic: 'UserRegistered',  fromBeginning: false });
  await consumer.subscribe({ topic: 'EventCreated',    fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        console.log(`[Kafka] ${topic}:`, data);
        if (topic === 'TicketBooked')    await handleTicketBooked(data);
        if (topic === 'TicketCancelled') await handleTicketCancelled(data);
        if (topic === 'UserRegistered')  await handleUserRegistered(data);
        if (topic === 'EventCreated')    await handleEventCreated(data);
      } catch (err) {
        console.error(`[Kafka] Error in ${topic}:`, err.message);
      }
    },
  });

  console.log('[Kafka] Listening on: TicketBooked, TicketCancelled, UserRegistered, EventCreated');
}

/* ── Handlers ── */
async function handleTicketBooked(data) {
  if (!data.userId && !data.userEmail) return;
  await Notification.create({
    userId:    data.userId    || data.userEmail,
    userEmail: data.userEmail || '',
    type:      'TicketPurchased',
    title:      'Ticket Booked!',
    message:   `Your ticket for "${data.eventTitle || data.eventId}" — Seat ${data.seat} has been confirmed.`,
    relatedId: data.ticketId || data.eventId,
  });
  console.log(`[Notification] TicketBooked saved for: ${data.userEmail}`);
}

async function handleTicketCancelled(data) {
  if (!data.userId && !data.userEmail) return;
  await Notification.create({
    userId:    data.userId    || data.userEmail,
    userEmail: data.userEmail || '',
    type:      'Information',
    title:     'Ticket Cancelled',
    message:   `Your ticket for "${data.eventTitle}" (Seat ${data.seat}) has been cancelled.`,
    relatedId: data.ticketId,
  });
}

async function handleUserRegistered(data) {
  // data: { id, email, role, fullName }
  const userId = data.id || data.userId;
  const email  = data.email;
  if (!userId && !email) return;
  await Notification.create({
    userId:    userId || email,
    userEmail: email  || '',
    type:      'Information',
    title:     ' Welcome to Eventra!',
    message:   `Hi ${data.fullName || email}, your account has been created successfully.`,
    relatedId: userId,
  });
}

async function handleEventCreated(data) {
  // data: { id, title } أو { organizerId, eventId, title }
  const organizerId = data.organizerId || data.id;
  if (!organizerId) return;
  await Notification.create({
    userId:    organizerId,
    userEmail: data.organizerEmail || '',
    type:      'EventApproved',
    title:     'Event Created',
    message:   `Your event "${data.title}" has been created successfully.`,
    relatedId: data.eventId || data.id,
  });
}

/* ── Start ── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));
startConsumer().catch(console.error);