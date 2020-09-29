import Discord from 'discord.js'
export default function sendWebhook({webhookURL, message}){
  //webhookURL = https://discordapp.com/api/webhooks/<id>/<token>
  let urlArray = webhookURL.split('/');
  let token = urlArray.pop();
  let id = urlArray.pop();
  // const hook = new Discord.WebhookClient(webhook.id, webhook.token);
  const hook = new Discord.WebhookClient(id, token);
  // Send a message using the webhook
  hook.send(message);
}

export function sendWebhookAsCreature({creature, content, embeds}){
  if (!creature || !creature.discordWebhook) return;
  sendWebhook({
    webhookURL: creature.discordWebhook,
    message: {
      username: creature.name,
      avatar_url: creature.avatarPicture,
      content,
      embeds,
    }
  });
}
