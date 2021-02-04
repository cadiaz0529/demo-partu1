const got = require('got');
const Twilio = require('twilio');
const { config } = require('../../whatsapp/utils/config');

const wappNumber = config.gases.whatsappNumber;
const client = new Twilio(config.twilio_account.accountSid, config.twilio_account.authToken);
const headers = {
  Authorization: config.twilio_flex.portalTokenUpdate,
};

const getInvoice = async (invoiceNumber, senderID) => {
  const url = `${config.gases.urlPortal}/invoices/${invoiceNumber}`;
  const options = { headers };
  try {
    const response = await got.get(url, options);
    const invoice = JSON.parse(response.body);
    if (invoice.data[0].url.length !== 0) {
      client.messages
        .create({
          from: wappNumber,
          to: `${senderID}`,
          mediaUrl: invoice.data[0].url,
        })
        .then((message) => console.log(message.sid))
        .done();

      client.messages
        .create({
          body: 'Esta es tú última factura!😁',
          from: wappNumber,
          to: `${senderID}`,
        })
        .then((message) => console.log(message.sid))
        .done();
    } else {
      client.messages
        .create({
          body: 'Tú factura no está disponible.',
          from: wappNumber,
          to: `${senderID}`,
        })
        .then((message) => console.log(message.sid))
        .done();
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getInvoice,
};
