const express = require('express');
const pollRouter = require('./routes/pollRoutes');

if (process.env.NODE_ENV === 'DEVELOPMENT') require('morgan')('dev');

const app = express();

app.use(express.json());
app.use('/api/v1', pollRouter);

module.exports = app;
