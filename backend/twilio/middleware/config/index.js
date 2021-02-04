module.exports = {
  integrator: {
    url: process.env.PORTAL_INTEGRATION,
    token: process.env.PORTAL_INTEGRATION_TOKEN,
    paths: {
      getBrillaInfo: '/contracts/brilla/v1',
      getInvoices: '/invoices/get/v2',
      getHolidays: '/days/getHolidays/v1',
      getDebt: '/contracts/debt/v1',
    },
  },
  portal: {
    url: process.env.PORTAL_URL,
    token: process.env.PORTAL_TOKEN,
    paths: {
      getInvoices: '/invoices',
      getRevisionHistory: '/revision/history',
    },
  },
  twilioAccount: {
    wappNumber: process.env.WAPPNUMBER,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
  general: {
    environment: process.env.APP_ENVIRONMENT || 'testing',
  },
};
