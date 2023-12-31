// Adds accounts-patreon support to bozhao:link-accounts
import { Meteor } from 'meteor/meteor';

export default function linkWithPatreon(options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }
  if (!Package['patreon-oauth']) {
    throw new Meteor.Error(403, 'Please include patreon-oauth package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['patreon-oauth'].Patreon.requestCredential(options, credentialRequestCompleteCallback);
}
