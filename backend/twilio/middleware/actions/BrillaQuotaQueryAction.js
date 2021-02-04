/* eslint-disable no-restricted-syntax */
const log = require('../logging');
const { CommonContexts, getParameter, hasParameter } = require('../common');
const getBrillaInfo = require('../lib/integrator/getBrillaInfo');
const messages = require('../../whatsapp/utils/messages');

async function handle(agent) {
  const contractId = getParameter(agent, CommonContexts.Contract.Key);
  try {
    agent.addImmediate(messages.WaitingMessages.processing);
    const {
      availableQuota,
      allocatedQuota,
      usedQuota,
      breachedPolicies,
    } = await getBrillaInfo(contractId);
    agent.add(
      'Esta es la información que encontré para tu '
        + `contrato *${contractId}*:\n`
        + `• Cupo asignado: ${allocatedQuota}\n`
        + `• Cupo usado: ${usedQuota}\n`
        + `• Cupo disponible: ${availableQuota}`,
    );
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
      agent.add(message);
    }
  } catch (err) {
    agent.add(messages.ErrorMessages.processing);
    log.error('[BrillaQuotaQueryAction] An error occurred', {
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
  action: 'BrillaQuotaQueryAction',
};
