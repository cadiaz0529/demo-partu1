const express = require('express');
const bodyParser = require('body-parser');
const flexFlow = require('./whatsapp/flexFlow')

const {config} = require('./whatsapp/utils/config')
const client = require('twilio')(config.twilio_account.accountSid, config.twilio_account.authToken);
const WA = require('./whatsapp/send-message');

var flex_flow = new flexFlow(client).getInstance()

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());


app.get('/health', (req, res) => {
  const healthcheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now()
	};
	try {
		res.send(healthcheck);
	} catch (e) {
		healthcheck.message = e;
		res.status(503).send();
	}
});

app.post('/whatsapp', async (req, res) => {
  console.log(req.body);

  let message = req.body.Body;
  let senderID = req.body.From;
  console.log('El body es: ', message, 'El senderID es: ', senderID);
  await WA.sendMessage(message, senderID);
}); 

const server = app.listen(config.project.port, () => {
  console.log(`app is up and running at ${config.project.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    flex_flow.deleteFlexFlow(client)
    console.log('Process terminated by SIGTERM')
  })
})

process.on('SIGINT', () => {
  server.close(() => {
    flex_flow.deleteFlexFlow(client)
    console.log('Process terminated by SIGINT')
  })
})

process.on('uncaughtException', () => {
  server.close(() => {
    flex_flow.deleteFlexFlow(client)
    console.log('Process terminated by uncaughtException')
  })
})