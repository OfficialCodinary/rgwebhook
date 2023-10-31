const express = require('express');
const ngrok = require("ngrok");
const tunnelmole = require('tunnelmole/cjs');
const EventEmitter = require('events');

process.env.TUNNELMOLE_QUIET_MODE = 1;

class WebhookInstance extends EventEmitter {
  constructor(options = { provider: 'tunnelmole' }) {
    super();
    this.app = express();
    this.port = 3000;
    this.webHostedUrl = null;
    this.webhooks = {};

    this.app.use(express.json());

    this.serverCallback = null;
    this.serverStarted = new Promise((resolve) => {
      this.serverCallback = resolve;
    });

    this.app.all('/', (req, res) => {
      if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'POST' || req.method === 'PUT') {
        const webhookId = req.query.webhookId;
        if (webhookId && this.webhooks[webhookId]) {
          delete req.query.webhookId;
          const data = (req.method === 'GET' || req.method === 'DELETE') ? req.query : req.body;
          this.webhooks[webhookId].emit(req.method, data);
        } else {
          res.status(404).json({ ok: false, message: 'Webhook not found' });
          return;
        }
      } else {
        res.status(400).json({ ok: false, message: 'Invalid request method' });
        return;
      }

      res.json({ ok: true, message: 'Data has been received and handled.' });
    });

    this.app.listen(this.port, async () => {
      if (options.provider == 'tunnelmole') {
        this.webHostedUrl = await tunnelmole({
          port: this.port,
        }).then((url) => {
          this.webHostedUrl = url;
          this.serverCallback();
        });
      }
      if (options.provider == 'ngrok') {
        this.webHostedUrl = await ngrok.connect({
          addr: this.port,
        }).then((url) => {
          this.webHostedUrl = url;
          this.serverCallback();
        });
      }
    });
  }

  createWebhook(webhookId) {
    if (this.webhooks[webhookId]) {
      throw new Error(`Webhook with ID "${webhookId}" already exists.`);
    }

    const webhookInstance = new EventEmitter();
    this.webhooks[webhookId] = webhookInstance;

    const webhookUrl = `${this.webHostedUrl}/?webhookId=${webhookId}`;

    return { webhookInstance, webhookUrl };
  }
}

module.exports = { WebhookInstance };
