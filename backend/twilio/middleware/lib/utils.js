const { serializeError } = require('serialize-error');
const { HTTPError } = require('got');

module.exports.prettifyMoney = (value) => {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  });
  return formatter.format(value);
};

module.exports.handleGotError = (err) => {
  // This function will always return an object.
  // If the error is instance of HTTPError, then it returns the body.
  // If not, then it returns the error serialized.
  if (err instanceof HTTPError) {
    const error = JSON.parse(err.response.body);
    return error;
  }
  const error = serializeError(err);
  return error;
};
