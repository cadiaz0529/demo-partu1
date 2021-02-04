const Twilio = require('twilio');
const { config } = require('../../whatsapp/utils/config');
const log = require('../logging');
const agentCommunication = require('../agent-communication');

const wappNumber = config.gases.whatsappNumber;

const client = new Twilio(
  config.twilio_account.accountSid,
  config.twilio_account.authToken,
);

const channels = new Map();
const invChannels = new Map();

function handleAgent(flexFlow, senderID, sessionData) {
  client.messages
    .create({
      body:
        'En unos segundos recibirás la atención de uno de nuestros agentes!😁',
      from: wappNumber,
      to: `${senderID}`,
    })
    .then(async () => {
      const ids = await agentCommunication.CreateAChannel(
        flexFlow.sid,
        senderID,
      );
      log.debug('[SUCCESS] success: Agent is created and linked', {
        newParameters: sessionData.parameters,
      });
      // Add agent to handle multiple requests
      channels.set(senderID, ids);
      invChannels.set(ids.channelId.sid, senderID);
    })
    .catch((error) => {
      log.error('[Error in GetAgent]: aggent coutl not be created', {
        error,
      });
    })
    .done();
}

function handleComunication(message, senderID) {
  if (channels.get(senderID)) {
    if (channels.get(senderID).channelId) {
      log.debug('[Linking] Linking with agent', {
        sender: senderID,
        channel: channels.get(senderID),
      });

      client.proxy
        .services(config.twilio_flex.flexProxyService)
        .sessions(`${channels.get(senderID).sessionId.sid}`)
        .participants(`${channels.get(senderID).agent.sid}`)
        .messageInteractions.create({ body: `${message}` })
        .then((messageInteraction) => console.log(messageInteraction.sid));
    }
  }
}

module.exports = {
  handleAgent,
  handleComunication,
};
