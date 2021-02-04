const Twilio = require('twilio');
const { config } = require('./utils/config');

const client = Twilio(config.twilio_account.accountSid, config.twilio_account.authToken);

class FlexFlow {
  constructor() {
    client.flexApi.flexFlow.create({
      contactIdentity: config.gases.whatsappNumber,
      enabled: false,
      integrationType: 'task',
      'integration.workflowSid': config.twilio_flex.workflowSid,
      'integration.workspaceSid': config.twilio_flex.workspaceSid,
      'integration.channel': config.twilio_flex.taskChannel,
      friendlyName: 'Outbound Whatsapp Message',
      chatServiceSid: config.twilio_flex.flexChatService,
      channelType: 'whatsapp',
    })
      .then((flexFlow) => {
        this.sid = flexFlow.sid;
        console.log('Flex flow creado exitosamente!');
      })
      .catch((error) => console.error('Error creating flex flow:', error));
  }

  deleteFlexFlow() {
    client.flexApi.flexFlow(this.sid).remove();
    console.log('Flexflow eliminado');
  }
}

module.exports = new FlexFlow();
