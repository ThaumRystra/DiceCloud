import Discord from 'discord.js'
export default function sendWebhook({webhook, message}){
  // const hook = new Discord.WebhookClient(webhook.id, webhook.token);
  const hook = new Discord.WebhookClient('420492135716880394', 'KHmRsf9QHd81C4LZOyQe_cUw5ua4ugSaIlpDMNWo3vcNHs0p0JBOHfeGWtHKqPXMYgkk');
  // Send a message using the webhook
  hook.send(message);
}
