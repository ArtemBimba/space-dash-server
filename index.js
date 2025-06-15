const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://deepeetechnologyx:Artem1911@spacedashcluster.ickrydf.mongodb.net/space-dash-db?retryWrites=true&w=majority&appName=SpaceDashCluster";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coins:    { type: Number, default: 4000000 },
  highscore:{ type: Number, default: 0 },
  calibers: { type: Number, default: 20 },          // ➕ нове поле
  caliberSlots: { type: Number, default: 20 }       // ➕ нове поле
});

const User = mongoose.model('User', userSchema);

// ✅ Registration
app.post('/register', async (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Invalid email format.");
  }

  const nicknameExists = await User.findOne({ nickname });
  if (nicknameExists) {
    return res.status(409).send("Nickname is already taken.");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(409).send("Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    nickname,
    email,
    password: hashedPassword,
    coins: 4000000,
    highscore: 0
  });

  await newUser.save();
  res.status(201).send("Registration successful!");
});

// ✅ Віднімання 4 млн монет
app.post('/buy-rocket', async (req, res) => {
  const { nickname } = req.body;

  const user = await User.findOne({ nickname });
  if (!user) return res.status(404).send("User not found.");

  if (user.coins < 4000000) {
    return res.status(400).send("Not enough coins.");
  }

  user.coins -= 4000000;
  await user.save();

  res.status(200).json({ message: "Rocket purchased.", coins: user.coins });
});

// ✅ Update stats
app.post('/update-stats', async (req, res) => {
  const { nickname, coins, highscore, calibers, caliberSlots } = req.body;

  const user = await User.findOne({ nickname });
  if (!user) return res.status(404).send("User not found.");

  user.coins = coins;
  user.highscore = highscore;
  user.calibers = calibers;
  user.caliberSlots = caliberSlots;

  await user.save();
  res.status(200).send("Stats updated successfully.");
});

// ✅ Delete account
app.post('/delete-account', async (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).send("Nickname is required.");
  }

  const user = await User.findOneAndDelete({ nickname });

  if (!user) {
    return res.status(404).send("User not found.");
  }

  res.status(200).send("Account deleted successfully.");
});

// ✅ Leaderboard: Top Players
app.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'nickname highscore').sort({ highscore: -1 }).limit(100);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("Error loading leaderboard.");
  }
});


// ✅ Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send("Invalid email or password.");

  res.status(200).json({
  nickname: user.nickname,
  coins: user.coins,
  highscore: user.highscore,
  calibers: user.calibers,
  caliberSlots: user.caliberSlots
});
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
