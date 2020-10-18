module.exports = class extends Error {
  constructor(message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
};
