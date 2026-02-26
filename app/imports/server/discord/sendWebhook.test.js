import { expect } from 'chai';
import sinon from 'sinon';
import fetch from 'node-fetch';
import Discord from 'discord.js';
import sendWebhook from './sendWebhook';

describe('sendWebhook', () => {
  let fetchStub;
  let discordStub;

  beforeEach(() => {
    fetchStub = sinon.stub(fetch, 'default');
    discordStub = sinon.stub(Discord.WebhookClient.prototype, 'send');
  });

  afterEach(() => {
    fetchStub.restore();
    discordStub.restore();
  });

  it('should handle Discord webhook URL correctly', async () => {
    const webhookURL = 'https://discordapp.com/api/webhooks/12345/abcdef';
    const data = { content: 'Hello, Discord!' };

    await sendWebhook({ webhookURL, data });

    expect(discordStub.calledOnce).to.be.true;
    expect(discordStub.firstCall.args[0]).to.deep.equal(data);
    expect(fetchStub.called).to.be.false;
  });

  it('should handle non-Discord webhook URL correctly', async () => {
    const webhookURL = 'https://example.com/webhook';
    const data = { content: 'Hello, Web!' };

    await sendWebhook({ webhookURL, data });

    expect(fetchStub.calledOnce).to.be.true;
    expect(fetchStub.firstCall.args[0]).to.equal(webhookURL);
    expect(fetchStub.firstCall.args[1]).to.deep.include({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    expect(discordStub.called).to.be.false;
  });
});