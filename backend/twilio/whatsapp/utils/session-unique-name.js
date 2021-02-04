const randomstring = require('randomstring');
const Twilio = require('twilio');
const { config } = require('./config');

const client = Twilio(config.twilio_account.accountSid, config.twilio_account.authToken);

const uniqueProxy = (channelSid) => {
  const proxysessions = new Map();
  let unique = false;
  let sessionUniqueName;
  client.proxy.services(config.twilio_flex.flexProxyService)
    .sessions
    .list({ limit: 1000 })
    .then((sessions) => sessions.forEach((s) => proxysessions.set(s.uniqueName, 0)));
  while (!unique) {
    sessionUniqueName = `${channelSid}.${randomstring.generate({ length: 10, charset: 'alphanumeric' })}`;
    if (!proxysessions.get(sessionUniqueName)) {
      unique = true;
    }
  }
  return sessionUniqueName;
};

module.exports = {
  uniqueProxy,
};
