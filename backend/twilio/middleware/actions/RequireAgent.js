/* eslint-disable no-restricted-syntax */
const messages = require('../../whatsapp/utils/messages');
const { CommonContexts } = require('../common');

function handle(agent) {
  agent.addTransfer(
    'En un momento uno de nuestros agentes te atenderá',
    agent.parameters,
  );
}

function requires(agent) {
  const { parameters } = agent;
  if (!parameters) {
    // If there is missing a parameter, then first check for it
    // in the database and set it in the conversation
  }
  const infoRequired = ['Person', 'Identification', 'Contract'];
  const output = [];
  for (const info of infoRequired) {
    const context = CommonContexts[info];
    if (!(context.Key in parameters)) {
      output.push({
        context,
        // eslint-disable-next-line no-unused-vars
        message: (_agent) => messages.AskingMessages[info],
      });
    }
  }
  return output;
}

module.exports = {
  handle,
  requires,
  action: 'RequireAgent',
};
