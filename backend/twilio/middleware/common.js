const moment = require('moment-timezone');
const log = require('./logging');
const { getHolidays } = require('./lib/cache');

const CommonContexts = {
  HabeasData: {
    Ask: 'habeas-data-request',
    Value: 'habeas-data-set',
    Key: 'habeas-data',
    KeyWord: 'habeas-data',
  },
  Contract: {
    Ask: 'contract-request',
    Value: 'contract-set',
    Key: 'contract',
    KeyWord: 'contrato',
  },
  Identification: {
    Ask: 'identification-request',
    Value: 'identification-set',
    Key: 'identification',
    KeyWord: 'cédula',
  },
  Person: {
    Ask: 'person-request',
    Value: 'person-set',
    Key: 'person',
    KeyWord: 'nombre',
  },
  Confirmation: {
    Ask: 'confirmation-request',
    Value: 'confirmation-set',
    Key: 'confirm',
  },
  Phone: {
    Ask: 'phone-request',
    Value: 'phone-set',
    Key: 'phone',
    KeyWord: 'teléfono',
  },
  PhoneToken: {
    Ask: 'phone-token-request',
    Value: 'phone-token-set',
    Key: 'phone_token',
  },
  Date: {
    Ask: 'date-request',
    Value: 'date-set',
    Key: 'date',
    KeyWord: 'fecha',
  },
  Installments: {
    Ask: 'installments-request',
    Value: 'installments-set',
    Key: 'installments',
  },
  Fee: {
    Ask: 'fee-request',
    Value: 'fee-set',
    Key: 'fee',
  },
};

/*
 * Map that stores data for all the sessions in the system, the data includes:
 * - nextStep: The next step to take for each session in case they're waiting
 *   for required input.
 * - context: The context data for the session.
 * - lastActivity: The time of the last recorded interaction from the session.
 */
const sessionData = {};

function ensureSessionData(sessionId) {
  const data = sessionData[sessionId];
  if (data) {
    return data;
  }

  sessionData[sessionId] = {
    nextStep: null,
    context: [],
    lastActivity: new Date(),
    parameters: {},
  };

  return sessionData[sessionId];
}

function updateSessionParameters(sessionId, parameters) {
  // Parameters example:
  // {
  //   contract: 123,
  //   identification: 456,
  //   person: { name: 'El Valle' }
  // }
  const data = ensureSessionData(sessionId);
  for (const param of Object.keys(parameters)) {
    const newValue = parameters[param];
    if (newValue !== null && newValue !== '') {
      if (param === CommonContexts.Person.Key) {
        data.parameters[param] = newValue.name;
      } else {
        data.parameters[param] = newValue;
      }
    }
  }
  data.lastActivity = new Date();
}

function hasParameter(agent, name) {
  const data = ensureSessionData(agent.sessionId);
  const value = data.parameters[name];
  // eslint-disable-next-line no-undefined
  return value !== undefined && value !== null && value !== '';
}

function clearParameter(agent, name) {
  const data = ensureSessionData(agent.sessionId);
  delete data.parameters[name];
}

function getParameter(agent, name) {
  const data = ensureSessionData(agent.sessionId);
  if (hasParameter(agent, name)) {
    return data.parameters[name];
  }
  return null;
}

function getConfirmationMessage(agent, context) {
  const value = getParameter(agent, context.Key);
  const keyWord = context.KeyWord;
  const confirmationMessage = 'Escriba \'si\' para continuar o \'no\' si desea corregir';
  if (keyWord) {
    return `¿Su ${keyWord} es *${value}*? ${confirmationMessage}`;
  }

  return `¿Es *${value}* correcto? ${confirmationMessage}`;
}

async function handleActionInternal(agent, action, requirements) {
  const data = ensureSessionData(agent.sessionId);
  if (requirements.length === 0) {
    data.nextStep = null;
    await action.handle(agent);
  } else {
    const nextRequirement = requirements[0];
    let remainingRequirements = requirements.slice(1);
    const isConfirmation = nextRequirement.context === CommonContexts.Confirmation;
    const hasValue = hasParameter(agent, nextRequirement.context.Key);

    log.debug('[handleAction] Verifying the next requirement', {
      context: nextRequirement.context,
      isConfirmation,
      hasValue,
      remainingRequirements,
    });

    if (isConfirmation) {
      // We're confirming a previous requirement
      const { confirm } = agent.parameters;

      // Clear and ask for the context value again if
      // the user did not confirm the previous value.
      if (confirm !== 'si') {
        agent.setContext(nextRequirement.parent.context.Value, 0);
        // Directly clear the context from the sessionData since
        // we'll be manually pumping the pipeline before returning
        // to the client.
        clearParameter(agent, nextRequirement.parent.context.Key);
        remainingRequirements = [
          nextRequirement.parent,
          ...remainingRequirements,
        ];
      }
      // We're not expecting the user to say anything at this point,
      // go to the next step in the pipeline and ask
      // him for the next requirement.
      data.nextStep = null;
      await handleActionInternal(agent, action, remainingRequirements);
      return;
    } if (hasValue) {
      // We have to ask for confirmation
      const message = getConfirmationMessage(agent, nextRequirement.context);
      agent.add(message);

      agent.setContext(CommonContexts.Confirmation.Ask, 1);
      remainingRequirements = [
        {
          context: CommonContexts.Confirmation,
          message: () => message,
          parent: nextRequirement,
        },
        ...remainingRequirements,
      ];
    } else {
      // We have to ask for both the value *and* its confirmation
      const message = await nextRequirement.message(agent);
      agent.add(message);

      // Set the context that will trigger the correct information-retrieval
      // intent upon receiving the next input.
      agent.setContext(nextRequirement.context.Ask, 1);

      // As an implementation detail, duplicate the context
      // requirement for the confirmation condition to kick in.
      remainingRequirements = [nextRequirement, ...remainingRequirements];
    }

    data.nextStep = (agent_) => handleActionInternal(agent_, action, remainingRequirements);
  }
}

async function handleAction(agent, action) {
  const requirements = await action.requires(agent);
  await handleActionInternal(agent, action, requirements);
}

async function handleInformationRequestAction(agent) {
  const session = agent.sessionId;
  const data = ensureSessionData(session);
  const { nextStep } = data;

  if (!nextStep) {
    log.error(
      '[handleInformationRequestAction] Unknown next step for session',
      { session },
    );
    return;
  }

  data.nextStep = null;
  await nextStep(agent);
}
async function isBusinessTime() {
  // Current working hours:
  // Monday to Friday 08:00 - 16:30
  const now = moment().tz('America/Bogota');
  const nowEarlier = moment().tz('America/Bogota').startOf('day');
  const holidays = await getHolidays();

  const format = 'HH:mm:ss';
  const openTime = moment('08:00:00', format);
  const closeTime = moment('16:30:00', format);

  if (holidays.find((date) => date.isSame(nowEarlier))) {
    log.debug('[isBusinessTime] Holiday!!');
    return false;
  } if (now.day() === 0) {
    return false;
  } if (now.day() < 6) {
    return now.isBetween(openTime, closeTime);
  }
  return false;
}

module.exports = {
  CommonContexts,
  hasParameter,
  getParameter,
  ensureSessionData,
  updateSessionParameters,
  handleAction,
  handleInformationRequestAction,
  isBusinessTime,
};
