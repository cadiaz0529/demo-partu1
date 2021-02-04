const WaitingMessages = {
  busy:
    'En estos momentos nuestros agentes se encuentran ocupados. '
    + 'Tennos un poco de paciencia por favor 😁',
  away:
    '¡Hola!, gracias por escribir a Gases del Caribe. Te recordamos que '
    + 'nuestro horario de atención es: lunes a viernes, de 8:00 AM a '
    + '4:30 PM\n\n'
    + 'Si necesitas hablar con un agente, te invitamos a volver '
    + 'en este horario 😁\n\n'
    + 'En Gases del Caribe, estamos contigo',
  processing: 'Estamos validando tu información, danos un minuto por favor 😉',
};

const FarewallMessages = {
  default:
    'Gracias por usar los canales de Gases del Caribe\n\n'
    + 'Recuerda que también nos puedes encontrar en\n'
    + '• WhastApp Gases del Caribe: https://wa.me/5753306164\n'
    + '• Portal Brilla: https://www.brillagascaribe.com\n'
    + '• Portal Gases del Caribe: https://portal.gascaribe.com/\n'
    + '• Líneas de atención gratuita: 164 o 01 8000 915 334',
};

const ErrorMessages = {
  default: 'No pude entenderte 😔, Por favor inténtalo de nuevo',
  processing:
    'Ups, al parecer hubo un error. Verifica tus datos e inténtalo de nuevo',
};

const AskingMessages = {
  Person: 'Digita tu nombre para continuar',
  Contract: 'Digita tu contrato para continuar',
  Identification: 'Digita tu cédula para continuar',
  HabeasData: '¿Aceptas la política de tratamiento de datos?',
};

const InfoMessages = {
  InvoicesPayment:
    'Recuerda que puedes generar tu cupón, pagar tu factura y mucho más sin '
    + 'salir de casa, sólo tienes que registrarte en el '
    + 'Portal Gascaribe https://portal.gascaribe.com/payments',
  PeriodicRevision:
    'Puedes solicitar tu *Revisión Periódica* en el Portal '
    + 'Gascaribe https://portal.gascaribe.com/periodic-revision. Si aún no '
    + 'estás registrado te invitamos a hacerlo e ingresar en la opción '
    + '_Revisión Periódica_',
  Debt:
    'Puedes consultar el detalle de tus saldos en el Portal Gascaribe '
    + 'https://portal.gascaribe.com/contracts/debt. Si aún no estás '
    + 'registrado te invitamos a hacerlo e ingresar en la opción '
    + '_Estado de Cuenta_',
  Privacy:
    'GASES DEL CARIBE. S.A. E.S.P, en calidad de responsable del '
    + 'tratamiento de datos personales, informa que los datos suministrados '
    + 'por las personas que utilizan este canal serán tratados de forma '
    + 'segura y confidencial, de acuerdo con el cumplimiento del Régimen '
    + 'de Protección de Datos Personales vigente en Colombia.\n'
    + 'Los datos recolectados serán tratados para fines de: '
    + 'atención a usuarios, PQRs, contactabilidad, mercadeo, publicidad, '
    + 'inteligencia de negocios y análisis para conocer las necesidades del '
    + 'mercado, respecto de nuestros usuarios del servicio de gas natural, '
    + 'potenciales usuarios del servicio de gas natural, clientes del '
    + 'Programa Brilla y/o potenciales consumidores de los bienes y/o '
    + 'servicios ofertados al mercado.\n'
    + 'Los datos personales serán tratados de forma directa por esta '
    + 'organización y/o a través de terceros encargados del tratamiento de'
    + 'datos personales. Tales datos podrán ser procesados en Colombia y/o '
    + 'en otros territorios dando cumplimiento a los dispuesto en materia de '
    + 'Transmisión Nacional e Internacional de Datos Personales. '
    + 'Estos datos no serán cedidos a terceros.\n'
    + 'Para el ejercicio del Habeas Data, el titular del dato personal o '
    + 'quien demuestre un legítimo interés conforme lo señalado en la '
    + 'normatividad vigente, podrá hacerlo a través del siguiente correo '
    + 'electrónico: habeasdata@gascaribe.com, o dirigiendo una comunicación '
    + 'a la siguiente dirección física: CR 54 No 59 - 144 en la ciudad de '
    + 'Barranquilla. La política de protección de datos personales está '
    + 'disponible mediante este enlace: '
    + 'https://gascaribe.com/politica-de-tratamiento-de-la-informacion-y'
    + '-datos-personales/',
};

module.exports = {
  WaitingMessages,
  FarewallMessages,
  ErrorMessages,
  AskingMessages,
  InfoMessages,
};
