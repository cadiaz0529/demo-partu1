const Twilio = require('twilio');
const { config } = require('./utils/config');

const client = Twilio(
  config.twilio_account.accountSid,
  config.twilio_account.authToken,
);

const log = require('../middleware/logging');

const agentCommunication = require('../middleware/agent-communication');

const flexFlow = require('./flexFlow');

const PLATAFORM = require('../middleware/response').DialogFlowPlatforms;

const middleware = require('../middleware/index');

const wappNumber = config.gases.whatsappNumber;

const channels = new Map();
const invChannels = new Map();

const receiveMessage = async (message, senderID) => {
  console.log(`senderID: ${senderID} --> channel: ${channels.get(senderID)}`);
  if (channels.get(senderID)) {
    if (channels.get(senderID).channelId) {
      client.proxy
        .services(config.twilio_flex.flexProxyService)
        .sessions(`${channels.get(senderID).sessionId.sid}`)
        .participants(`${channels.get(senderID).agent.sid}`)
        .messageInteractions.create({ body: `${message}` })
        .then((messageInteraction) => console.log(messageInteraction.sid));
    }
  } else if (message === 'agente') {
    client.messages
      .create({
        body:
          'En unos segundos recibirás la atención de uno de nuestros agentes!😁',
        from: wappNumber,
        to: `${senderID}`,
      })
      .then(
        console.log(
          'Success: En unos segundos recibirás al atención de uno de nuestros agentes.',
        ),
      )
      .then(async () => {
        const ids = await agentCommunication.CreateAChannel(
          flexFlow.sid,
          senderID,
        );

        channels.set(senderID, ids);
        invChannels.set(ids.channelId.sid, senderID);
      })
      .catch((error) => console.error(error))
      .done();
  } else if (!channels.get(senderID)) {
    try {
      await middleware
        .processMessage(
          senderID,
          message,
          PLATAFORM.WhatsApp,
          async (response) => client.messages
            .create({
              body: response,
              from: wappNumber,
              to: `${senderID}`,
            })
            .then((msg) => console.log(msg.sid))
            .done(),
        )
        .then((res) => {
          client.messages
            .create({
              body: res.fulfillmentText,
              from: wappNumber,
              to: `${senderID}`,
            })
            .then((msg) => console.log(msg.sid));
        });
    } catch (error) {
      console.error(error.message);
      client.messages
        .create({
          body: `ERROR: ${error}`,
          from: wappNumber,
          to: `${senderID}`,
        })
        .then(message)
        .done();
    }
  }
};

const finishAgent = async (channelSid, status) => {
  const senderID = invChannels.get(channelSid);
  const channelSenderId = channels.get(senderID);
  if (status === 'Finished' && channelSenderId) {
    await agentCommunication
      .deleteChannel(channelSenderId)
      .then(() => {
        console.log('Successfully deleted channel');

        channels.delete(senderID);
        invChannels.delete(channelSid);
        log.debug('[SUCCESS] delete channel');
      })
      .catch((error) => {
        log.error('[Error] could not finish agent', { error });
      });
  }
};

module.exports = {
  receiveMessage,
  finishAgent,
};
