import Discord from 'discord.js'
export default function sendWebhook({webhookURL, message, options}){
  //webhookURL = https://discordapp.com/api/webhooks/<id>/<token>
  let urlArray = webhookURL.split('/');
  let token = urlArray.pop();
  let id = urlArray.pop();
  const hook = new Discord.WebhookClient(id, token);
  // Send a message using the webhook
  hook.send(message, options)
}

export function sendWebhookAsCreature({creature, content, embeds}){
  if (!creature || !creature.settings || !creature.settings.discordWebhook) return;
  sendWebhook({
    webhookURL: creature.settings.discordWebhook,
    message: content,
    options: {
      username: creature.name,
      avatarURL: creature.avatarPicture,
      embeds,
    },
  });
}
