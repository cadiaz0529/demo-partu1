const { struct } = require('pb-util');
const dialogflow = require('./dialogflow');
const actionMap = require('./actionMap');
const common = require('./common');
const log = require('./logging');
const { Response } = require('./response');
const allContexts = require('./contexts').contexts;
const invoice = require('./getExternal/getInvoice');
const debt = require('./getExternal/getDebt');
const brilla = require('./getExternal/getBrilla');
const agent = require('./getExternal/getAgent');

const flexflow = require('../whatsapp/flexFlow');

function extractContextName(context) {
  return context.slice(context.lastIndexOf('/contexts/') + 10);
}

function getContext(context) {
  return allContexts.find((data) => data.name === context.name);
}

function compareContexts(a, b) {
  const c = getContext(a);
  const d = getContext(b);

  if (c.level === d.level) {
    return b.lifespan - a.lifespan;
  }
  return c.level - d.level;
}

function parseContextsUnique(contexts) {
  let output = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const context of contexts) {
    output.push({
      name: extractContextName(context.name),
      lifespan: context.lifespanCount,
    });
  }

  output = output.sort(compareContexts);
  const result = [];
  result.push(output[0]);
  let resultidx = 1;
  for (let i = 1; i < output.length; i += 1) {
    if (
      getContext(result[resultidx - 1]).level !== getContext(output[i]).level
    ) {
      result.push(output[i]);
      resultidx += 1;
    }
  }
  console.log(result);
  return result;
}

function parseContexts(contexts) {
  const output = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const context of contexts) {
    output.push({
      name: extractContextName(context.name),
      lifespan: context.lifespanCount,
    });
  }

  return output;
}

function findContext(context, name) {
  return context.find((el) => el.name === name);
}

async function getAction(contexts, intent, senderID, sessionData) {
  // context to get invoice
  if (
    findContext(contexts, 'contract-set')
    && findContext(contexts, 'menu-facturacion_cartera')
    && intent === 'facturacion_cartera-consultas'
    && sessionData.parameters && sessionData.parameters.contract
  ) {
    await invoice.getInvoice(sessionData.parameters.contract, senderID);
  }

  // Context to get brilla cupo
  if (findContext(contexts, 'menu-brilla')
    && intent === 'brilla-cupo' && sessionData
    && sessionData.parameters.contract) {
    await brilla.getBrilla(sessionData.parameters.contract, senderID);
  }

  // context to get estado de cuenta
  if (findContext(contexts, 'menu-facturacion_cartera')
    && intent === 'facturacion_cartera-estado_cuenta' && sessionData
    && sessionData.parameters.contract) {
    await debt.getDebt(sessionData.parameters.contract, senderID);
  }

  if (intent === 'agent') {
    log.debug('[Agente]');
    await agent.handleAgent(flexflow.sid, senderID, sessionData);
  }
}

async function processMessage(
  sessionId,
  message,
  platform,
  sendImmediateMessage,
  handleIntent,
) {
  log.debug('[processMessage] Handling message', {
    sessionId,
    text: message,
    platform,
  });

  if (!sendImmediateMessage) {
    log.error('[processMessage] Invalid sendImmediateMessage callback', {
      sessionId,
      text: message,
      platform,
    });
  }

  const sessionData = common.ensureSessionData(sessionId);
  const { context } = sessionData;
  log.debug('[processMessage] Contexts', {
    inputContext: context,
  });

  sessionData.lastActivity = new Date();

  log.debug('[processMessage] Using input DialogFlow contexts', {
    contexts: context,
    sessionId,
    text: message,
  });

  let dialogFlowResponse;
  try {
    dialogFlowResponse = await dialogflow.executeQueries(
      sessionId,
      message,
      context,
    );
  } catch (error) {
    log.error('[DF Error] error with dialog flow connection', { error });
  }

  const result = dialogFlowResponse.response.queryResult;
  if (!dialogFlowResponse.response) {
    log.error('[processMessage] Empty DialogFlow response', {
      sessionId,
      text: message,
    });
    // Return an empty response set so the bots don't
    // attempt to hog the chat while erroring out.
    return [];
  }

  const actionName = result.action;

  log.debug('[processMessage] Detected action', {
    action: actionName,
    sessionId,
    text: message,
  });

  const intentName = result.intent.displayName;
  /* Revisar
  if (handleIntent) {
    await handleIntent(intentName);
  } else {
    log.info('[processMessage] handleIntent callback was not provided', {
      sessionId
    });
  }
  */

  sessionData.context = parseContexts(dialogFlowResponse.context);

  log.debug('[processMessage] Using output DialogFlow contexts', {
    contexts: sessionData.context,
    sessionId,
    text: message,
  });

  const action = actionMap.get(actionName);
  console.log('ACTION: ', action);
  console.log('ACTIONMAP: ', actionMap);

  const parameters = struct.decode(result.parameters);
  if (Object.keys(parameters).length !== 0) {
    common.updateSessionParameters(sessionId, parameters);
    log.debug('[processMessage] Parameters updated', {
      newParameters: sessionData.parameters,
    });
  }

  await getAction(
    sessionData.context,
    intentName,
    sessionId,
    sessionData,
  );

  await agent.handleComunication(message, sessionId);

  return result;

  /*
  if (!action) {
    log.verbose(
      '[processMessage] Could not find handler for action, ' +
        'falling back to DialogFlow',
      {
        action: actionName
      }
    );

    return Response.FromDialogFlowResponses(
      result.fulfillmentMessages,
      platform
    );
  }

  console.log("sessionData",sessionData);

  const agent = new Agent(
    sessionId,
    dialogFlowResponse,
    sessionData.context,
    sessionData.parameters,
    sendImmediateMessage
  );
  await action(agent);

  // Update the contexts with whatever new info we have from the action handlers
  sessionData.context = agent.outputContext;

  console.log("sessionData",sessionData);

  log.debug('[processMessage] Using output Handler contexts', {
    contexts: sessionData.context,
    sessionId,
    text: message
  });

  console.log("Returning",  agent.responses.filter((response) => response.supports(platform)));

  return agent.responses.filter((response) => response.supports(platform));
  */
}

module.exports = {
  processMessage,
};
