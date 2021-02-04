/* eslint-disable max-len */
const config = require('../../config');
const got = require('got');
const log = require('../../logging');
const { handleGotError } = require('../utils');
const { deserializeError } = require('serialize-error');
const NoCertificateError = require('./exceptions');

module.exports = async (contractId) => {
  const url = `${config.portal.url}${config.portal.paths.getRevisionHistory}/${contractId}`;
  const headers = {
    Authorization: config.portal.token
  };
  const options = { headers };
  try {
    const response = await got.get(url, options);
    const body = JSON.parse(response.body);
    if (body.status !== 'success') {
      const error = JSON.stringify(body.errors);
      log.error('[getRevisionHistory] Unsuccessful request', {
        contractId,
        error
      });
      throw new Error('Unsuccessful request');
    }
    return body.data;
  } catch (err) {
    // It returns 404 iff the contract has not certificates
    if (err.response.statusCode === 404) {
      throw new NoCertificateError('El contrato no tiene certificados');
    }
    const errorObject = handleGotError(err);
    const error = deserializeError(errorObject);
    // If the object returned by handleGotError has a message property,
    // then the error is returned as it came. Otherwise, a new Error is
    // returned with the stringified object
    if (error.message) {
      throw error;
    }
    throw new Error(JSON.stringify(errorObject));
  }
};
