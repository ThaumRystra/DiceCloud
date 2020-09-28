Template.registerHelper("isTier5", function(){
  let user = Meteor.user();
  if (!user) return false;
  patreon = user.patreon;
  if (!patreon) return false;
  return patreon.entitledCents >= 300 || patreon.entitledCentsOverride >= 300;
});
