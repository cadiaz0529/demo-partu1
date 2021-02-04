const { Response, ResponseTypes, ResponsePlatforms } = require('./response');
const log = require('./logging');

class Agent {
  constructor(
    sessionId,
    dialogFlowData,
    context,
    parameters,
    sendImmediateMessage
  ) {
    this.sessionId = sessionId;
    this.dialogFlowData = dialogFlowData;
    this.inputContext = context;
    this.parameters = parameters;

    // Immediately send a message to the user via a client-provided callback,
    // this is useful to inform the user before an action does something that
    // is expected to take a long time. Should be used sparingly.
    this.sendImmediateMessage = sendImmediateMessage;

    this.outputContext = [];

    // Responses that will be sent to the user after
    // an action finishes executing.
    this.responses = [];
  }

  getOutputContext(name) {
    return this.outputContext.find((context) => context.name === name);
  }

  getInputContext(name) {
    return this.inputContext.find((context) => context.name === name);
  }

  setContext(name, lifespan) {
    // We have to increment the context lifespans by 1 due to an
    // implementation detail in the way we invoke DialogFlow,
    // we first invoke detectIntent before calling the handlers,
    // this causes DialogFlow to reduce the lifespan of the contexts
    // and removes any that were set to 1 before the handler runs.
    const newLifespan = lifespan === 0 ? 0 : lifespan + 1;
    log.debug('[Agent.setContext] Setting context', {
      sessionId: this.sessionId,
      name,
      lifespan
    });

    const context = this.getOutputContext(name);

    if (context) {
      context.name = name;
      context.lifespan = newLifespan;
    } else {
      this.outputContext.push({
        name,
        lifespan: newLifespan
      });
    }
  }

  async addImmediate(response) {
    log.silly('[Agent.addImmediate] Sending immediate response to agent', {
      sessionId: this.sessionId,
      response,
      type: typeof response
    });

    if (typeof response === 'string') {
      await this.addImmediate(Response.FromText(response));
      return;
    }

    if (![ResponsePlatforms.Any, this.platform].includes(response.platform)) {
      return;
    }

    await this.sendImmediateMessage(response);
  }

  add(response) {
    log.silly('[Agent.add] Adding response to agent', {
      sessionId: this.sessionId,
      response,
      type: typeof response
    });

    if (typeof response === 'string') {
      this.addText(response);
      return;
    }
    if (response instanceof Response) {
      this.responses.push(response);
      return;
    }
    throw new Error(
      `Unsupported response ${response} of type ${typeof response}`
    );
  }

  addTransfer(text, parameters) {
    const payload = {
      message: text,
      parameters
    };
    const response = new Response(
      ResponseTypes.TransferToAgent,
      ResponsePlatforms.Any,
      payload
    );
    this.responses.push(response);
  }

  addText(text) {
    const response = Response.FromText(text);
    this.responses.push(response);
  }

  addImage(url, message) {
    const payload = {
      url,
      message
    };
    const response = new Response(
      ResponseTypes.Image,
      ResponsePlatforms.Any,
      payload
    );
    this.responses.push(response);
  }

  addDocument(url, name) {
    const payload = {
      url,
      name
    };
    const response = new Response(
      ResponseTypes.Document,
      ResponsePlatforms.Any,
      payload
    );
    this.responses.push(response);
  }
}

module.exports = Agent;
