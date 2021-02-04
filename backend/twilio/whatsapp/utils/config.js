require('dotenv').config();

const config = {
  gases: {
    urlPortal: process.env.PORTAL_URL,
    whatsappNumber: process.env.WAPPNUMBER,
  },

  project: {
    port: process.env.PORT,
  },

  twilio_account: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },

  twilio_flex: {
    workflowSid: process.env.TWILIO_WORKFLOW_SID,
    workspaceSid: process.env.TWILIO_WORKSPACE_SID,
    taskChannel: process.env.TWILIO_TASKCHANNEL,
    flexChatService: process.env.FLEX_CHAT_SERVICE,
    portalTokenUpdate: process.env.PORTAL_TOKEN_UPDATE,
    portalTokenUpdate2: process.env.PORTAL_TOKEN_UPDATE_2,

    flexProxyService: process.env.FLEX_PROXY_SERVICE,
  },
};

module.exports = { config };
