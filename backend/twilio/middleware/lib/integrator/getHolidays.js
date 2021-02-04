/* eslint-disable max-len */
const got = require('got');
const { HTTPError } = require('got');
const config = require('../../config');

module.exports = async (year, month) => {
  const url = `${config.integrator.url}${config.integrator.paths.getHolidays}`;
  const json = { year, month };
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
        'Unexpected response status code for year-month '
          + `${year}-${month}: ${statusCode} - ${JSON.stringify(body)}`,
      );
    }
    if (!Object.prototype.hasOwnProperty.call(body, 'data')) {
      throw new Error(
        `Invalid response for year-month ${year}-${month}: ${JSON.stringify(
          body,
        )}`,
      );
    }
    const holidays = body.data;
    return holidays;
  } catch (err) {
    if (err instanceof HTTPError) {
      throw new Error(
        `${err.response.statusCode}: ${err.response.statusMessage} ${err.response.body}`,
      );
    }
    throw err;
  }
};
