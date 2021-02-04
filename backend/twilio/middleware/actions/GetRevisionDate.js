const moment = require('moment-timezone');
const log = require('../logging');
const { CommonContexts, getParameter, hasParameter } = require('../common');
const getRevisionHistory = require('../lib/portal/getRevisionHistory');
const messages = require('../../whatsapp/utils/messages');
const NoCertificateError = require('../lib/portal/exceptions');

async function handle(agent) {
  try {
    agent.addImmediate(messages.WaitingMessages.processing);
    const contractId = getParameter(agent, CommonContexts.Contract.Key);
    const revisionInfo = await getRevisionHistory(contractId);

    const status = revisionInfo.period;
    const notificationDate = moment(revisionInfo.notificationDate)
      .locale('es')
      .format('MMMM, YYYY');
    const suspensionDate = moment(revisionInfo.suspensionDate)
      .locale('es')
      .format('MMMM, YYYY');

    let msg;
    switch (status) {
      // Certificado vigente
      case 1:
        msg = 'Actualmente tu certificado está vigente ✅\n'
          + 'Recuerda que tu período de revisión va desde '
          + `${notificationDate} hasta ${suspensionDate} 😁`;
        break;

      // Período de revisión
      case 2:
        msg = 'Actualmente estás en el período de revisión 🕵🏽\n'
          + 'Ahora es el mejor momento para certificarte. Recuerda que '
          + 'sin tu certificación tu servicio podría ser suspendido '
          + `a partir de ${suspensionDate}`
          + `\n\n${messages.InfoMessages.PeriodicRevision}`;
        break;

      // Suspensión
      case 3:
        msg = 'Actualmente tu certificado está vencido ✂️\n'
          + 'Tu servicio podría ser suspendido en cualquier momento, '
          + 'solicita tu revisión tan pronto como sea posible'
          + `\n\n${messages.InfoMessages.PeriodicRevision}`;
        break;

      default:
        msg = 'Default message';
    }

    agent.add(msg);
  } catch (err) {
    if (err instanceof NoCertificateError) {
      agent.add(
        'Tu contrato nunca ha sido certificado 😨\n'
          + 'Te invitamos a solicitar tu revisión periódica lo antes '
          + 'posible para evitar la suspensión de tu servicio'
          + `\n${messages.InfoMessages.PeriodicRevision}`,
      );
      return;
    }
    agent.add(messages.ErrorMessages.processing);
    log.error('[GetRevisionDate] An error occurred', {
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
  action: 'GetRevisionDate',
};
