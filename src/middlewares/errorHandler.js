const { isHttpError } = require('http-errors');

const errorHandler = (error, req, res, next) => {
  if (isHttpError(error)) {
    const { status, message } = error;
    return res.status(status).json({ error: message });
  }

  console.error(error);
  res.status(500).json({ error: 'something really bad just happened' });
};

module.exports = { errorHandler };