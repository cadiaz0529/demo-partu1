const { CommonContexts, getParameter, hasParameter } = require('../common');
const messages = require('../../whatsapp/utils/messages');

async function handle(agent) {
  const accept = getParameter(agent, CommonContexts.HabeasData.Key);
  if (accept === 'si') {
    agent.add(':)');
  } else {
    agent.add(':(');
  }
}

function requires(agent) {
  if (!hasParameter(agent, CommonContexts.HabeasData.Key)) {
    // If the parameter is not defined in the current conversation,
    // first search for the value in the database and set it.
    // const sessionId = agent.sessionId;
    // const accept = getFromDataBase(agent, CommonContexts.HabeasData.Key);
    // updateSessionParameters(sessionId, { 'habeas-data': accept });
  }
  // const accept = getParameter(agent, CommonContexts.HabeasData.Key);
  const accept = 'si';
  if (accept !== 'si') {
    agent.add(messages.InfoMessages.Privacy);
    return [
      {
        context: CommonContexts.HabeasData,
        message: (_agent) => messages.AskingMessages.HabeasData,
      },
    ];
  }
  return [];
}

module.exports = {
  handle,
  requires,
  // action: 'HabeasDataActionDisable'
  action: 'HabeasDataAction',
};
