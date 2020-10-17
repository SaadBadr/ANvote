const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const app = require('./app');
const mongoose = require('mongoose');

const connection_string =
  process.env.NODE_ENV === 'DEVELOPMENT'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(connection_string, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(console.log('DB connection successful!'));

app.listen(process.env.PORT, () =>
  console.log(`APP IS RUNNING ON PORT ${process.env.PORT}`)
);
