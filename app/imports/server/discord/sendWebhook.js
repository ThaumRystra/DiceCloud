// import { WebhookClient } from 'discord.js'
export default function sendWebhook({ webhookURL, data = {} }) {
  return;
  //webhookURL = https://discordapp.com/api/webhooks/<id>/<token>
  const urlArray = webhookURL.split('/');
  const token = urlArray.pop();
  const id = urlArray.pop();

  // prevent discord mention exploit
  data.allowedMentions = { parse: [] };

  const hook = new WebhookClient({ id, token });
  try {
    // Send a message using the webhook
    hook.send(data);
  } catch (e) {
    // Swallow the error, we don't really care
    console.error(e);
  }
}

export function sendWebhookAsCreature({ creature, data = {} }) {
  return;
  if (!creature || !creature.settings || !creature.settings.discordWebhook) return;
  data.username = creature.name;
  data.avatarURL = creature.avatarPicture;
  sendWebhook({
    webhookURL: creature.settings.discordWebhook,
    data,
  });
}
