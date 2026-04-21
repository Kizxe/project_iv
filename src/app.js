const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

module.exports = app;