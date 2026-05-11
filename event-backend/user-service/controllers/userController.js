const userService = require('../services/userService');

class UserController {
    async register(req, res, next) {
        try {
            const newUser = await userService.registerUser(req.body);
            res.status(201).json({
                message: 'Success: User registered successfully',
                userId: newUser._id
            });
        } catch (error) {
            if (error.message === 'Email already registered') {
                return res.status(400).json({ error: error.message });
            }
            next(error); // Pass to global error handler
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await userService.loginUser(email, password);
            res.json({
                message: 'Login successful',
                user: result.user,
                token: result.token
            });
        } catch (error) {
            if (error.message === 'Invalid email or password') {
                return res.status(400).json({ error: error.message });
            }
            next(error); // Pass to global error handler
        }
    }
}

module.exports = new UserController();
