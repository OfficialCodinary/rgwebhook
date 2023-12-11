const fastify = require('fastify');
const ngrok = require("@ngrok/ngrok");
const tunnelmole = require('tunnelmole/cjs');
const localtunnel = require('localtunnel')
const EventEmitter = require('node:events');

process.env.TUNNELMOLE_QUIET_MODE = 1;

const app = fastify();
let webHostedUrl = null;
const webhooks = {};
let serverStarted = false

app.register(require('@fastify/sensible'));

/**
 * Starts the server and exposes it using ngrok or tunnelmole.
 * @param {Object} options - Configuration options.
 * @param {String} options.provider - Provider to use ('ngrok' or 'tunnelmole').
 * @param {Object} options.launchOptions - Options specific to the provider.
 * @param {Object} options.fastifyOptions - Options to be passed to fastify.
 * @param {Number} options.port - Port to start the server on.
 * @returns {Promise<boolean>} A Promise that resolves when the server is started.
 */

async function startServer(options = {
  provider: 'ngrok',
  launchOptions: {},
  port: 3000, fastifyOptions: {}
}) {

  return new Promise((resolve, reject) => {
    try {
      app.listen({ port: options.port, ...options.fastifyOptions }, async (err) => {
        if (err) {
          reject(err);
        }
        if (options.provider === 'tunnelmole') {
          webHostedUrl = await tunnelmole({
            port: options.port,
            ...options.launchOptions
          })
        } else if (options.provider === 'ngrok') {
          webHostedUrl = (await ngrok.forward({
            port: options.port,
            ...options.launchOptions
          })).url()
        } else if (options.provider === 'localtunnel') {
          webHostedUrl = (await localtunnel({
            port: options.port,
            ...options.launchOptions
          })).url
        } else {
          reject(new Error('Invalid provider'));
        }
        console.log('Server started with', options.provider);
        serverStarted = !serverStarted
        resolve(true);
      });
    } catch (err) {
      reject(err)
    }
  });
}

app.setErrorHandler((error, request, reply) => {
  reply.send({ error, request, reply });
});

app.all('/', (req, res) => {
  res.type('application/json')
  if (!['GET', 'DELETE', 'POST', 'PUT'].includes(req.method)) {
    res.code(400).send({ ok: false, message: 'Invalid request method' });
    return;
  }

  const webhookId = req.query.webhookId;
  if (!webhookId || !webhooks[webhookId]) {
    res.code(404).send({ ok: false, message: 'Webhook not found' });
    return;
  }

  delete req.query.webhookId;
  var webhookData = req.query.webhookData || null;
  delete req.query.webhookData
  if (webhookData) webhookData = JSON.parse(decodeURI(webhookData))

  const data = (req.method === 'GET' || req.method === 'DELETE') ? req.query : req.body;
  webhooks[webhookId].emit(req.method, {
    webhookData,
    data: data || null,
  });

  res.code(200).send({ ok: true, message: 'Data has been received and handled.' });
});

/**
 * Creates a new webhook and returns its instance and URL.
 * @param {string} webhookId - Unique identifier for the webhook.
 * @param {object} [data] - Data associated with the webhook.
 * @returns {{ webhookInstance: EventEmitter, webhookUrl: string }} An object containing the webhook instance and URL.
 * @throws {Error} Throws an error if the server is not started or if the webhook ID already exists.
 */

function createWebhook(webhookId, data) {
  if (!serverStarted || !webHostedUrl) {
    throw new Error('Webhook server not started');
  }
  var webhookInstance;
  if (!webhooks[webhookId]) {
    webhookInstance = new EventEmitter();
    webhooks[webhookId] = webhookInstance;
  } else {
    webhookInstance = webhooks[webhookId]
  }

  const webhookUrl = `${webHostedUrl}/?webhookId=${webhookId}${data ? `&webhookData=${encodeURI(JSON.stringify(data))}` : ''}`;

  return { webhookInstance, webhookUrl };
}

module.exports = { startServer, createWebhook };