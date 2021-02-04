/* eslint-disable no-restricted-syntax */
const got = require('got');
const Twilio = require('twilio');
const { integrator, twilioAccount } = require('../config/index');
const { prettifyMoney } = require('../lib/utils');

const { wappNumber } = twilioAccount;
const client = new Twilio(twilioAccount.accountSid, twilioAccount.authToken);
const headers = {
  Authorization: integrator.token,
};

const getDebt = async (invoiceNumber, senderID) => {
  const url = `${integrator.url}${integrator.paths.getDebt}`;

  try {
    // console.log(`url: ${url}`);
    const json = {
      contractId: invoiceNumber,
    };
    const options = { headers, json };
    const response = await got.post(url, options);
    // console.log('response.data', response.body);
    const debtInfo = JSON.parse(response.body).data;
    // console.log('Debt:', debtInfo);

    const currentValue = prettifyMoney(debtInfo.currentValue);
    const deferredValue = prettifyMoney(debtInfo.deferredValue);
    const punishedValue = prettifyMoney(debtInfo.punishedValue);

    const punishedMessage = punishedValue === prettifyMoney(0)
      ? ''
      : `\n• Deuda castigada: ${punishedValue}`;

    let finalMessage = `Esta es la información que encontré para tu contrato *${invoiceNumber}*\n`
    + `• Deuda corriente: ${currentValue}\n`
    + `• Deuda diferida: ${deferredValue} ${punishedMessage} \n`;

    let commonValueMessage = 'Resumen del saldo corriente por tipo de producto\n';
    let deferredValueMessage = 'Resumen del saldo diferido por tipo de producto\n';

    const productTypes = {
      Gas: [7014],
      Brilla: [7055, 7056],
    };

    if (debtInfo.currentValue && debtInfo.currents) {
      for (const type of Object.keys(productTypes)) {
        let value = 0;
        debtInfo.currents
          .filter((current) => productTypes[type].includes(current.productTypeId))
          .forEach((current) => {
            value += current.value;
          });
        commonValueMessage += `• ${type}: ${prettifyMoney(value)}\n`;
      }
    }

    if (debtInfo.deferredValue && debtInfo.deferreds) {
      for (const type of Object.keys(productTypes)) {
        let value = 0;
        debtInfo.deferreds
          .filter((deferred) => productTypes[type].includes(deferred.productTypeId))
          .forEach((deferred) => {
            value += deferred.pendingValue;
          });
        deferredValueMessage += `• ${type}: ${prettifyMoney(value)}\n`;
      }
    }
    finalMessage += commonValueMessage + deferredValueMessage;

    client.messages
      .create({
        body: finalMessage,
        from: wappNumber,
        to: `${senderID}`,
      })
      .then((message) => console.log(message.sid))
      .done();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getDebt,
};
