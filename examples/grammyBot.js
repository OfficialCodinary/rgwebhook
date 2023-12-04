const { Bot } = require('grammy')
const { createWebhook, startServer } = require('rgwebhook')
const bot = new Bot('0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZ')

bot.command('start', async (ctx) => {
  const instance = createWebhook(ctx.from.id, { text: 'Hello World!' });
  ctx.reply(`Click on the below link to get Hello world\n\n[Click here](${instance.webhookUrl})`, {
    disable_web_page_preview: true,
    parse_mode: 'Markdown'
  })
  instance.webhookInstance.on('GET', async (res) => {
    ctx.reply(res.webhookData.text)
  })
})

bot.catch(err => console.error)

startServer({ provider: 'ngrok', port: 3000 })
  .then(() => {
    bot.start({
      onStart: (me) => console.log('Bot Started!', me)
    })
  })
