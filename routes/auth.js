const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// ✅ Реєстрація
router.post('/register', async (req, res) => {
  const { nickname, email, password } = req.body;

  try {
    // 🔁 Перевірка на унікальність нікнейму
    const existingUser = await User.findOne({ nickname });
    if (existingUser) {
      return res.status(400).json({ message: 'Цей нікнейм вже зайнято' });
    }

    // 🔁 Перевірка на унікальність пошти
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Ця пошта вже зареєстрована' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nickname, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Користувач зареєстрований успішно' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// ✅ Вхід
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Невірна пошта або пароль' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Невірна пошта або пароль' });

    // ✨ Надсилаємо дані клієнту
    res.status(200).json({
      message: 'Вхід успішний',
      nickname: user.nickname,
      coins: user.coins,
      highscore: user.highscore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;
