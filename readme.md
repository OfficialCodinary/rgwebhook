Certainly, here's the revised documentation including parameters for the functions:

---

# RgWebhook

## Overview

`RgWebhook` is a Node.js library designed to simplify the creation and management of webhooks using Express. It provides functionalities to create a local server for handling webhooks and exposes them via tunneling services like `ngrok`, `tunnelmole` or `localtunnel`.

## Installation

Install the `rgwebhook` package via npm:

```bash
npm install rgwebhook
```

## Usage

### Initializing the Webhook Server

```javascript
const { startServer, createWebhook } = require('rgwebhook');

// Start the server using ngrok
startServer({ provider: 'ngrok', port: 3000 })
  .then(() => {
    console.log('Server started!');
  })
  .catch((err) => {
    console.error('Error starting the server:', err);
  });
```

### Creating a Webhook

```javascript
try {
  const { webhookInstance, webhookUrl } = createWebhook('uniqueWebhookID', { additionalData: 'optional' });
  console.log('Webhook created with URL:', webhookUrl);

  // Use webhookInstance to listen for events
  webhookInstance.on('GET', (data) => {
    console.log('Received GET request data:', data);
  });
} catch (error) {
  console.error('Error creating the webhook:', error);
}
```

## API Reference

### `startServer(options)`

Starts the Express server and exposes it using the specified tunneling service.

- `options` (Object): Configuration options for starting the server.
  - `provider` (String): The tunneling service provider (`ngrok` or `tunnelmole` or `localtunnel`).
  - `port` (Number): The port on which the server will run.
  - `launchOptions` (Object, optional): Custom parameters to be passed to the respective provider on start.
  - `fastifyOptions` (Object, optional): Custom parameters to be passed to fastify on start.

Returns a Promise that resolves when the server is successfully started.

### `createWebhook(webhookId, data?)`

Creates a new webhook with a unique identifier and associated data.

- `webhookId` (String): A unique identifier for the webhook.
- `data` (Object, optional): Additional data associated with the webhook.

Returns an object containing the webhook instance (`EventEmitter`) and its URL.

## Notes

- Ensure the server is started before creating webhooks.
- Implement error handling to manage potential exceptions.
- Consider securing your webhooks with authentication mechanisms in production environments.

## Version

Current version: `0.3.0`

---