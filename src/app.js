const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const studentRoutes = require('./routes/students');
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes); // boleh protect lepas ni


module.exports = app;