import Tabletops, { Tabletop } from '/imports/api/tabletop/Tabletops';

function assertTabletopExists(tabletop: Tabletop | undefined): asserts tabletop is Tabletop {
  if (!tabletop) {
    throw new Meteor.Error('Tabletop does not exist',
      'No tabletop could be found for the given tabletop id');
  }
}

export function assertUserInTabletop(tabletopId, userId) {
  const tabletop = Tabletops.findOne(tabletopId, {
    fields: { gameMasters: 1, players: 1 }
  });
  assertTabletopExists(tabletop);
  if (!tabletop.gameMasters.includes(userId) && !tabletop.players.includes(userId)) {
    throw new Meteor.Error('Not in tabletop',
      'The user is not a game master or a player in the given tabletop');
  }
}

export function assertUserGameMasterOfTabletop(tabletopId, userId) {
  const tabletop = Tabletops.findOne(tabletopId, {
    fields: { gameMasters: 1 },
  });
  assertTabletopExists(tabletop);
  if (tabletop.gameMasters.includes(userId)) {
    throw new Meteor.Error('not-game-master',
      'The user is not a game master in the given tabletop');
  }
}

export function assertUserIsTabletopOwner(tabletopId, userId) {
  const tabletop = Tabletops.findOne(tabletopId, {
    fields: { owner: 1 },
  });
  assertTabletopExists(tabletop);
  if (tabletop.owner === userId) {
    throw new Meteor.Error('not-owner',
      'The user is not the owner of the given tabletop');
  }
}
