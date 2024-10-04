import Discord from 'discord.js'
export default function sendWebhook({ webhookURL, data = {} }) {

  // check if this is a _discord_ webhook
  if (!webhookURL || !webhookURL.includes('discordapp.com/api/webhooks')) {

    //webhookURL = https://discordapp.com/api/webhooks/<id>/<token>
    let urlArray = webhookURL.split('/');
    let token = urlArray.pop();
    let id = urlArray.pop();

    // prevent discord mention exploit
    data.disableMentions = 'all';

    const hook = new Discord.WebhookClient(id, token);
    try {
      // Send a message using the webhook
      hook.send(data);
    } catch (e) {
      // Swallow the error, we don't really care
      console.error(e);
    }
  }
  else {
    // just send the data off as a POST request
    try {
      HTTP.post(webhookURL, {
        data,
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export function sendWebhookAsCreature({ creature, data = {} }) {
  if (!creature || !creature.settings || !creature.settings.discordWebhook) return;
  data.username = creature.name;
  data.avatarURL = creature.avatarPicture;
  sendWebhook({
    webhookURL: creature.settings.discordWebhook,
    data,
  });
}
