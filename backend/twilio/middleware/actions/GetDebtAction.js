/* eslint-disable no-restricted-syntax */
const log = require('../logging');
const { CommonContexts, getParameter, hasParameter } = require('../common');
const { prettifyMoney } = require('../lib/utils');
const getDebt = require('../lib/integrator/getDebt');
const messages = require('../../whatsapp/utils/messages');

async function handle(agent) {
  const contractId = getParameter(agent, CommonContexts.Contract.Key);
  try {
    agent.addImmediate(messages.WaitingMessages.processing);

    const debtInfo = await getDebt(contractId);

    const currentValue = prettifyMoney(debtInfo.currentValue);
    const deferredValue = prettifyMoney(debtInfo.deferredValue);
    const punishedValue = prettifyMoney(debtInfo.punishedValue);

    const punishedMessage = punishedValue === prettifyMoney(0)
      ? ''
      : `\n• Deuda castigada: ${punishedValue}`;

    agent.add(
      `Esta es la información que encontré para tu contrato *${contractId}*\n`
        + `• Deuda corriente: ${currentValue}\n`
        + `• Deuda diferida: ${deferredValue}${punishedMessage}`,
    );

    let currentMessage = 'Resumen del saldo corriente por tipo de producto\n';
    let deferredMessage = 'Resumen del saldo diferido por tipo de producto\n';

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
        currentMessage += `• ${type}: ${prettifyMoney(value)}\n`;
      }
      agent.add(currentMessage);
    }

    if (debtInfo.deferredValue && debtInfo.deferreds) {
      for (const type of Object.keys(productTypes)) {
        let value = 0;
        debtInfo.deferreds
          .filter((deferred) => productTypes[type].includes(deferred.productTypeId))
          .forEach((deferred) => {
            value += deferred.pendingValue;
          });
        deferredMessage += `• ${type}: ${prettifyMoney(value)}\n`;
      }
      agent.add(deferredMessage);
    }

    agent.add(messages.InfoMessages.Debt);
  } catch (err) {
    agent.add(messages.ErrorMessages.processing);
    log.error('[GetDebtAction] An error occurred', {
      contractId,
      error: err.message,
    });
  }
}

function requires(agent) {
  if (!hasParameter(agent, CommonContexts.Contract.Key)) {
    // If the parameter is not defined in the current conversation,
    // first search for the value in the database and set it.
    // const sessionId = agent.sessionId;
    // const contract = getFromDataBase(agent, CommonContexts.Contract.Key);
    // updateSessionParameters(sessionId, { contract });
  }
  return [
    {
      context: CommonContexts.Contract,
      // eslint-disable-next-line no-unused-vars
      message: (_agent) => messages.AskingMessages.Contract,
    },
  ];
}

module.exports = {
  handle,
  requires,
  action: 'GetDebtAction',
};
