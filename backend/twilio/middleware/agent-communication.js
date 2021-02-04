const Twilio = require('twilio');
const { config } = require('../whatsapp/utils/config');

const client = new Twilio(
  config.twilio_account.accountSid,
  config.twilio_account.authToken,
);

const wappNumber = config.gases.whatsappNumber;
const utils = require('../whatsapp/utils/session-unique-name');
const log = require('./logging');

const addAgent = async (sessionSid, channelSid) => {
  let agentP = null;
  await client.proxy
    .services(config.twilio_flex.flexProxyService)
    .sessions(`${sessionSid}`)
    .participants.create({
      identifier: `${channelSid}`,
      proxyIdentifier: wappNumber,
    })
    .then((participant) => {
      agentP = participant;
      log.debug('[SUCCESS] agente agregado con éxito', { participant });
    })
    .catch((error) => {
      log.error('[Error] error creating participant', { error });
    });
  return agentP;
};

const linkProxy = async (channelSid, senderID, flexFlowSid) => {
  let sessionId;
  let agent;
  const uniqueProxyName = utils.uniqueProxy(channelSid);
  await client.proxy
    .services(config.twilio_flex.flexProxyService)
    .sessions.create({
      uniqueName: uniqueProxyName,
      mode: 'message-only',
      participants: [
        {
          Identifier: senderID,
          ProxyIdentifier: wappNumber,
        },
      ],
    })
    .then(async (session) => {
      agent = await addAgent(session.sid, channelSid, flexFlowSid);
      sessionId = session;
    })
    .catch((error) => {
      log.error('[Error] Linking proxy failed', { error });
    });
  return {
    sessionId,
    agent,
  };
};

const CreateAChannel = async (flexFlowSid, senderID) => {
  const result = {
    sessionId: 0,
    channelId: 0,
    agent: null,
  };
  await client.flexApi.channel
    .create({
      target: wappNumber,
      identity: `${senderID}`,
      chatFriendlyName: `Outbound Chat with ${senderID}`,
      flexFlowSid: `${flexFlowSid}`,
      chatUserFriendlyName: 'chat_user_friendly_name',
    })
    .then(async (channel) => {
      log.debug('[Sucess] Channel successfully created', { channel });
      const session = await linkProxy(channel.sid, senderID, flexFlowSid);
      result.sessionId = session.sessionId;
      result.channelId = channel;
      result.agent = session.agent;
    })
    .catch((error) => {
      log.error('[Error] error creating channel or linking proxy', { error });
    });
  return result;
};

const deleteChannel = async (ids) => {
  console.log('channel to be deleted: ', ids.channelId.sid);
  console.log('sessions to be deleted: ', ids.sessionId.sid);

  client.proxy
    .services(config.twilio_flex.flexProxyService)
    .sessions(ids.sessionId.sid)
    .remove()
    .then((response) => {
      log.debug('[Success] session deleted', {
        response,
      });
    })
    .catch((error) => {
      log.error('[ERROR]: Could not delete session in proxy', error);
    });
};

module.exports = {
  CreateAChannel,
  deleteChannel,
};
