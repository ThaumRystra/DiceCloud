import request from 'request'

export default function sendWebhook({webhookURL, data = {}}){
  request({
    url: webhookURL,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    json: true,
    body: {
      ...data,
      allowed_mentions: {parse:[]} // prevent discord mention exploit
    }
  })
}

export function sendWebhookAsCreature({creature, data = {}}){
  if (!creature || !creature.settings || !creature.settings.discordWebhook) return;
  data.username = creature.name;
  data.avatarURL = creature.avatarPicture;
  sendWebhook({
    webhookURL: creature.settings.discordWebhook,
    data,
  });
}
