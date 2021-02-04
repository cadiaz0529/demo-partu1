const log = require('./logging');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_NAME;
const LANGUAGE_CODE = 'es';

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

async function simpleChannel(
  projectId = process.env.DIALOGFLOW_PROJECT_NAME,
  message
) {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: message,
        // The language used by the client (en-US)
        languageCode: "es",
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log("Detected intent");
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  return result;
}





async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode
      }
    }
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

function getParameterKind(value) {
  if (typeof value === 'number') {
    return 'numberValue';
  }

  return 'stringValue';
}

async function executeQueries(
  projectId,
  sessionId,
  query,
  languageCode,
  contexts
) {
  // Keeping the context across queries let's us simulate an
  // ongoing conversation with the bot
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const context = [];

  for (const context_ of contexts) {
    let params = null;
    if (context_.parameters) {
      params = {
        fields: {}
      };

      for (const paramName of Object.keys(context_.parameters)) {
        const value = context_.parameters[paramName];
        const kind = getParameterKind(value);

        params.fields[paramName] = {
          kind,
          [kind]: value
        };
      }
    }

    context.push({
      name: `${sessionPath}/contexts/${context_.name}`,
      lifespanCount: context_.lifespan,
      parameters: params
    });
  }

  let intentResponse;
  try {
    log.silly('[executeQueries] Sending Query', {
      query
    });

    intentResponse = await detectIntent(
      projectId,
      sessionId,
      query,
      context,
      languageCode
    );

    // Use the context from this response for next queries
    return {
      response: intentResponse,
      context: intentResponse.queryResult.outputContexts
    };
  } catch (error) {
    log.error('[executeQueries] Error detecting intent', {
      error
    });
    return {
      response: null,
      context: []
    };
  }
}

module.exports = {
  executeQueries: (sessionId_, queries_, context) =>
    executeQueries(PROJECT_ID, sessionId_, queries_, LANGUAGE_CODE, context),
  simpleChannel: (message) =>
    simpleChannel(process.env.DIALOGFLOW_PROJECT_NAME, message),
};
