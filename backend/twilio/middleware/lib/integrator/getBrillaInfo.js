/* eslint-disable max-len */
const got = require('got');
const { HTTPError } = require('got');
const config = require('../../config');

module.exports = async (contractId) => {
  const url = `${config.integrator.url}${config.integrator.paths.getBrillaInfo}`;
  const json = { contractId };
  const headers = {
    Authorization: config.integrator.token,
  };
  const options = { headers, json };
  try {
    const response = await got.post(url, options);
    const body = JSON.parse(response.body);
    const { statusCode } = response;
    if (statusCode !== 200) {
      throw new Error(
        'Unexpected response status code for contract '
          + `${contractId}: ${statusCode} - ${JSON.stringify(body)}`,
      );
    }
    if (!Object.prototype.hasOwnProperty.call(body, 'data')) {
      throw new Error(
        `Invalid response for contract ${contractId}: ${JSON.stringify(body)}`,
      );
    }

    const brillaInfo = body.data;
    return brillaInfo;
  } catch (err) {
    if (err instanceof HTTPError) {
      throw new Error(
        `${err.response.statusCode}: ${err.response.statusMessage} ${err.response.body}`,
      );
    }
    throw err;
  }
};
