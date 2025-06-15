const mongoose = require('mongoose');

// Створюємо схему користувача
const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  coins: {
    type: Number,
    default: 0
  },
  highscore: {
    type: Number,
    default: 0
  }
});

// Експортуємо модель
module.exports = mongoose.model('User', userSchema);
