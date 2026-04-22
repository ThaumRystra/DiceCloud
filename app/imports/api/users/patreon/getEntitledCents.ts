export default function getEntitledCents(user: Meteor.User) {
  if (!user) return 0;
  const patreon = user.services && user.services.patreon;
  if (!patreon) return 0;
  let entitledCents = patreon.entitledCents || 0;
  const overrideCents = patreon.entitledCentsOverride || 0;
  if (overrideCents > entitledCents) entitledCents = overrideCents;
  return entitledCents;
}
