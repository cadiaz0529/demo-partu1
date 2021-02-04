const log = require('../logging');
const moment = require('moment-timezone');
const getHolidaysOSF = require('./integrator/getHolidays');

const holidaysCache = {
  data: null,
  lastUpdated: null
};

module.exports.getHolidays = async (year, month) => {
  const lastUpdated = holidaysCache.lastUpdated;
  const data = holidaysCache.data;
  const now = moment();

  if (
    !data ||
    data.length === 0 ||
    lastUpdated === null ||
    now.diff(lastUpdated, 'days') > 2
  ) {
    try {
      const holidays = await getHolidaysOSF();
      holidaysCache.data = holidays.map((date) =>
        moment.tz(date.DATE_, 'America/Bogota')
      );
      holidaysCache.lastUpdated = now;
    } catch (err) {
      log.error(
        '[getHolidays] Could not update cache',
        year,
        month,
        err.message
      );
    }
  }
  const result = holidaysCache.data.filter(
    (date) =>
      (!year || date.year() === year) && (!month || date.month() === month)
  );
  return result;
};
