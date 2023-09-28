import updatePatreonDetails from '/imports/api/users/patreon/updatePatreonDetails';
const ONE_DAY = 24 * 60 * 60 * 1000;

Accounts.onLogin(({ user }) => {
  let patreon = user.services && user.services.patreon;
  if (patreon) {
    const timeSinceIdentityUpdate = new Date() - patreon.lastUpdatedIdentity;
    if (timeSinceIdentityUpdate > ONE_DAY) {
      updatePatreonDetails(user);
    }
  }
});
