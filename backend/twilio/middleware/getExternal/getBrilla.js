/* eslint-disable no-restricted-syntax */
const got = require('got');
const Twilio = require('twilio');
const { integrator, twilioAccount } = require('../config/index');

const { wappNumber } = twilioAccount;
const client = new Twilio(twilioAccount.accountSid, twilioAccount.authToken);
const headers = {
  Authorization: integrator.token,
};

const getBrilla = async (invoiceNumber, senderID) => {
  const url = `${integrator.url}${integrator.paths.getBrillaInfo}`;
  try {
    const json = {
      contractId: invoiceNumber,
    };
    const options = { headers, json };
    const response = await got.post(url, options);
    console.log('response.body', response.body);
    const brillaInfo = JSON.parse(response.body).data;
    const {
      availableQuota,
      allocatedQuota,
      usedQuota,
      breachedPolicies,
    } = brillaInfo;

    let finalMessage = `Esta es la información que encontré para tu contrato *${invoiceNumber}*:\n`
    + `• Cupo asignado: ${allocatedQuota}\n`
    + `• Cupo usado: ${usedQuota}\n`
    + `• Cupo disponible: ${availableQuota}\n`;

    if (
      allocatedQuota === 0
      && Array.isArray(breachedPolicies)
      && breachedPolicies.length > 0
    ) {
      let message = 'Actualmente no tienes cupo asignado porque no cumples con '
        + 'las siguientes políticas:';
      for (const breachedPolicy of breachedPolicies) {
        message += `\n-${breachedPolicy.OBSERVATION}`;
      }
      finalMessage += message;
    }
    client.messages
      .create({
        body: finalMessage,
        from: wappNumber,
        to: `${senderID}`,
      })
      .then((message) => console.log(message.sid))
      .done();
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getBrilla,
};
