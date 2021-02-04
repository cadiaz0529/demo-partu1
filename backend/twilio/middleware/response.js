const log = require('./logging');

const ResponseTypes = {
  Text: 0,
  QuickReplies: 1,
  TransferToAgent: 2,
  Image: 3,
  Document: 4
};

const ResponsePlatforms = {
  Any: 0,
  WebChat: 1,
  WhatsApp: 2,
  Facebook: 3
};

const DialogFlowPlatforms = {
  Any: 'PLATFORM_UNSPECIFIED',
  Telegram: 'TELEGRAM',
  WhatsApp: 'WHATSAPP',
  Facebook: 'FACEBOOK'
};

const DialogFlowTypes = {
  Text: 'text',
  QuickReplies: 'quickReplies'
};

const DialogFlowPlatformsTable = {
  [DialogFlowPlatforms.Any]: ResponsePlatforms.Any,
  [DialogFlowPlatforms.Telegram]: ResponsePlatforms.WebChat,
  [DialogFlowPlatforms.WhatsApp]: ResponsePlatforms.WhatsApp,
  [DialogFlowPlatforms.Facebook]: ResponsePlatforms.Facebook
};

class Response {
  constructor(type, platform, payload) {
    this.type = type;
    this.platform = platform;
    this.payload = payload;
  }

  supports(platform) {
    if (this.platform === ResponsePlatforms.Any) {
      return true;
    }

    return this.platform === platform;
  }

  static FromDialogFlow(dialogFlowResponse) {
    const platform = dialogFlowResponse.platform;
    const type = dialogFlowResponse.message;
    if (type === DialogFlowTypes.Text) {
      return dialogFlowResponse.text.text.map((text) => {
        return Response.FromText(text);
      });
    }

    if (type === DialogFlowTypes.QuickReplies) {
      const payload = dialogFlowResponse.quickReplies;
      return [
        new Response(
          ResponseTypes.QuickReplies,
          DialogFlowPlatformsTable[platform],
          payload
        )
      ];
    }

    log.error(
      '[Response.FromDialogFlow] Unsupported DialogFlow response type',
      {
        type
      }
    );

    return [];
  }

  static FromDialogFlowResponses(dialogFlowResponses, platform) {
    const responses = [];
    const defaultResponses = [];
    for (const response of dialogFlowResponses) {
      log.silly(
        '[Response.FromDialogFlowResponses] Parsing DialogFlow response',
        {
          response
        }
      );

      if (response.platform === DialogFlowPlatforms.Any) {
        defaultResponses.push(...this.FromDialogFlow(response));
        continue;
      }

      if (response.platform !== platform) {
        continue;
      }

      responses.push(...this.FromDialogFlow(response));
    }

    if (responses.length === 0) {
      log.silly(
        // eslint-disable-next-line max-len
        '[Response.FromDialogFlowResponses] No responses matched platform, using default',
        {
          platform
        }
      );
      return defaultResponses;
    }

    return responses;
  }

  static FromText(text) {
    return new Response(ResponseTypes.Text, ResponsePlatforms.Any, {
      message: text
    });
  }
}

module.exports = {
  Response,
  ResponseTypes,
  ResponsePlatforms,
  DialogFlowPlatforms
};
