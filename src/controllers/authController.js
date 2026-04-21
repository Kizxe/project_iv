const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    // encrypt password — jangan simpan plaintext!
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.createUser(username, hashedPassword);

    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    if (err.code === '23505') // postgres unique violation
      return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findUserByUsername(username);
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    // compare password dengan hash dalam DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid credentials' });

    // buat token — expires dalam 1 hari
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };