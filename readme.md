

# RgWebhook Documentation

## Introduction

`rgwebhook` is a JavaScript library for creating and managing webhooks using various providers. This documentation provides an overview of how to use the library, its core functionalities, and an example of how to set up and use a webhook.

## Installation

You can install `rgwebhook` using npm:

```bash
npm install rgwebhook
```

## API Reference

### `WebhookInstance`

#### Constructor

- `WebhookInstance(options)`: Creates a new instance of the `WebhookInstance` class with the specified options.

  - `options.provider`: The webhook provider to use (e.g., 'tunnelmole').

#### Methods

- `createWebhook(webhookId)`: Creates a new webhook with the given `webhookId`. Returns an object containing the `webhookInstance` and its `webhookUrl`.

### Events

- `on(method, callback)`: Adds an event listener for a specific HTTP method (`GET`, `POST`, `PUT`, or `DELETE`). When a request of the specified method is received, the `callback` function is executed.


## Usage

To use `rgwebhook`, follow these steps:

### Import the `WebhookInstance` class

First, import the `WebhookInstance` class from the `rgwebhook` library:

```javascript
const { WebhookInstance } = require('rgwebhook');
```

### Initialize a Webhook Instance

Create a new `WebhookInstance` and specify the provider you want to use. In this example, we use the "tunnelmole" provider:

```javascript
const instance = new WebhookInstance({
  provider: 'tunnelmole' // or ngrok
});
```

### Start the Webhook Server

Start the webhook server by waiting for the `serverStarted` promise to resolve:

```javascript
console.log('Starting server....')
await instance.serverStarted;
console.log('Server Started!')
```

### Create a Webhook

Create a new webhook by calling the `createWebhook` method and providing a unique `webhookId`:

```javascript
const { webhookInstance, webhookUrl } = instance.createWebhook('webhookId');
console.log('Webhook URL:', webhookUrl);
```

### Handle Webhook Requests

You can listen for different HTTP request methods (GET, POST, PUT, DELETE) and handle them using the `on` method. Here's an example of handling a GET request:

```javascript
webhookInstance.on('GET', (res) => {
  console.log('GET request received:', res);
});
```

You can repeat this pattern for other request methods (POST, PUT, DELETE) as well.

### Example Usage

Below is a complete example of how to use `rgwebhook` to create and handle a webhook:

```javascript
const { WebhookInstance } = require('rgwebhook');

async function main() {
  const instance = new WebhookInstance({
    provider: 'tunnelmole' // or ngrok
  });

  console.log('Starting server....');
  await instance.serverStarted;
  console.log('Server Started!')

  const { webhookInstance, webhookUrl } = instance.createWebhook('webhookId');
  console.log('Webhook URL:', webhookUrl);

  webhookInstance.on('GET', (res) => {
    console.log('GET request received:', res);
  });

  webhookInstance.on('POST', (res) => {
    console.log('POST request received:', res);
  });

  webhookInstance.on('DELETE', (res) => {
    console.log('DELETE request received:', res);
  });

  webhookInstance.on('PUT', (res) => {
    console.log('PUT request received:', res);
  });
}

main();
```

## Conclusion

`rgwebhook` is a versatile library for managing webhooks with various providers. This documentation provides a basic overview of how to use the library's core features. You can explore more advanced functionality and customization options in the library's source code and documentation.

---
Feel free to contact [ROBBING GAMER](https://t.m/ROBBING_GAMER) on telegram for any doubts, bugs about this library.