const express = require('express');
const pollRouter = require('./routes/pollRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

if (process.env.NODE_ENV === 'DEVELOPMENT') app.use(require('morgan')('dev'));

app.use(express.json());
app.use('/api/v1', pollRouter);
app.use(globalErrorHandler);
module.exports = app;
