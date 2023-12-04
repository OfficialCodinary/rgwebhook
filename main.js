const express = require('express');
const ngrok = require("ngrok");
const tunnelmole = require('tunnelmole/cjs');
const EventEmitter = require('events');

process.env.TUNNELMOLE_QUIET_MODE = 1;

const app = express();
let webHostedUrl = null;
const webhooks = {};
let serverStarted = false

app.use(express.json());

/**
 * Starts the server and exposes it using ngrok or tunnelmole.
 * @param {Object} options - Configuration options.
 * @param {string} options.provider - Provider to use ('ngrok' or 'tunnelmole').
 * @param {Object} options.launchOptions - Options specific to the provider.
 * @param {number} options.port - Port to start the server on.
 * @returns {Promise<boolean>} A Promise that resolves when the server is started.
 */

async function startServer(options = { provider: 'ngrok' , launchOptions: {}, port: 3000}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, async () => {
      let chosenProvider;

      if (options.provider === 'tunnelmole') {
        chosenProvider = tunnelmole;
      } else if (options.provider === 'ngrok') {
        chosenProvider = ngrok.connect;
      } else {
        reject(new Error('Invalid provider'));
      }

      try {
        webHostedUrl = await chosenProvider({
          port: port,
          ...launchOptions
        });
        console.log('Server started with', chosenProvider.name || chosenProvider.toString());
        serverStarted = !serverStarted
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}


app.all('/', (req, res) => {
  if (!['GET', 'DELETE', 'POST', 'PUT'].includes(req.method)) {
    res.status(400).json({ ok: false, message: 'Invalid request method' });
    return;
  }

  const webhookId = req.query.webhookId;
  if (!webhookId || !webhooks[webhookId]) {
    res.status(404).json({ ok: false, message: 'Webhook not found' });
    return;
  }

  delete req.query.webhookId;
  const data = (req.method === 'GET' || req.method === 'DELETE') ? req.query : req.body;
  const webhookData = req.query.webhookData || null;
  webhooks[webhookId].emit(req.method, {
    webhookData,
    data,
  });

  res.json({ ok: true, message: 'Data has been received and handled.' });
});

/**
 * Creates a new webhook and returns its instance and URL.
 * @param {string} webhookId - Unique identifier for the webhook.
 * @param {object} [data] - Data associated with the webhook.
 * @returns {{ webhookInstance: EventEmitter, webhookUrl: string }} An object containing the webhook instance and URL.
 * @throws {Error} Throws an error if the server is not started or if the webhook ID already exists.
 */

function createWebhook(webhookId, data) {
  if (!serverStarted) {
    throw new Error('Webhook server not started');
  }

  if (webhooks[webhookId]) {
    throw new Error(`Webhook with ID "${webhookId}" already exists.`);
  }

  const webhookInstance = new EventEmitter();
  webhooks[webhookId] = webhookInstance;
  const webhookUrl = `${webHostedUrl}/?webhookId=${webhookId}${data ? `&webhookData=${JSON.stringify(data)}` : ''}`;

  return { webhookInstance, webhookUrl };
}

module.exports = { startServer, createWebhook };
