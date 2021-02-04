module.exports = class NoCertificateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoCertificateError';
  }
};
