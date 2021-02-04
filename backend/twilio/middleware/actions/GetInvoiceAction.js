const moment = require('moment-timezone');
const log = require('../logging');
const { CommonContexts, getParameter, hasParameter } = require('../common');
const { prettifyMoney } = require('../lib/utils');
const getInvoices = require('../lib/portal/getInvoices');
const messages = require('../../whatsapp/utils/messages');

async function handle(agent) {
  const contractId = getParameter(agent, CommonContexts.Contract.Key);
  try {
    agent.addImmediate(messages.WaitingMessages.processing);
    log.debug('[GetInvoiceAction] Getting invoice for contract', {
      contractId,
    });
    const invoices = await getInvoices(contractId);

    // OSF generates invoice records *before* assigning a value to them.
    // This means we can end up with an invoice that has no coupon and
    // has a pending value of $0. Filter those out so that only the
    // good invoices are shown.
    const filteredInvoices = invoices.filter((invoice) => Boolean(invoice.couponId));

    if (
      !filteredInvoices
      || !Array.isArray(filteredInvoices)
      || filteredInvoices.length === 0
    ) {
      agent.add(`El contrato *${contractId}* aún no tiene facturas generadas`);
      return;
    }

    // By default, it returns the last invoice. In the future it could change
    const invoice = filteredInvoices[0];
    const invoiceUrl = invoice.url;
    const { isPaid } = invoice;
    const { couponId } = invoice;

    const generationDate = moment(invoice.generationDate)
      .locale('es')
      .format('MMMM DD, YYYY');
    const expirationDate = moment(invoice.expirationDate)
      .locale('es')
      .format('MMMM DD, YYYY');

    const totalValue = prettifyMoney(invoice.couponValue);

    let msg = 'Esta es la información de la última factura para el '
      + `contrato ${contractId}:\n`
      + `• Número de factura: ${invoice.id}\n`
      + `• Fecha de generación de factura: ${generationDate}\n`
      + `• Fecha de pago oportuno: ${expirationDate}\n`;

    if (isPaid) {
      msg += `• Valor total de la factura: ${totalValue}`;
    } else {
      msg
        += `• Valor pendiente de la factura: ${totalValue}\n`
        + `• Cupón para pagos: ${couponId}`;
    }

    agent.add(msg);

    if (isPaid) {
      agent.add('Gracias por pagar tu factura a tiempo ❤️');
    } else if (invoice.expirationDate > moment()) {
      agent.add(`Recuerda pagar tu factura antes de ${expirationDate} 😁`);
    } else {
      agent.add('Te invitamos a ponerte al día con el pago de tu factura');
    }

    if (invoiceUrl) {
      agent.addDocument(invoiceUrl, invoice.id);
    }
    agent.add(`${messages.InfoMessages.InvoicesPayment}/coupon/${couponId}`);
  } catch (err) {
    agent.add(messages.ErrorMessages.processing);
    log.error('[GetInvoiceAction] An error occurred', {
      contractId,
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
  action: 'GetInvoiceAction',
};
