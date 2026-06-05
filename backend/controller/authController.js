
const User = require('../models/User'); // افترضنا إن عندك موديل للمستخدم
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. التأكد من وجود المستخدم
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
        }

        // 2. تشفير كلمة السر
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. إنشاء المستخدم
        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // 4. عمل Token (اختياري لو عايز تسجله دخول فوراً)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, message: 'تم التسجيل بنجاح' });
    } catch (err) {
        res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
    }
};
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بيانات الاعتماد غير صحيحة' });
        }

        // 2. مقارنة كلمة السر
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'بيانات الاعتماد غير صحيحة' });
        }

        // 3. إنشاء الـ JWT Token
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
};