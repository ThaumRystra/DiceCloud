import Tabletops, { Tabletop } from '/imports/api/tabletop/Tabletops';

type TabletopOrId = Tabletop | string | undefined;

function assertTabletopExists(tabletop: Tabletop | undefined): asserts tabletop is Tabletop {
  if (!tabletop) {
    throw new Meteor.Error('Tabletop does not exist',
      'Tabletop not found');
  }
}

function getTabletop(tabletop: TabletopOrId): Tabletop | undefined {
  if (typeof tabletop === 'string') {
    return Tabletops.findOne(tabletop, {
      fields: { gameMasters: 1, players: 1, owner: 1, spectators: 1 }
    });
  } else {
    return tabletop
  }
}

export function assertUserInTabletop(tabletopOrId: TabletopOrId, userId: string) {
  const tabletop = getTabletop(tabletopOrId);
  assertTabletopExists(tabletop);
  if (!tabletop.gameMasters.includes(userId) && !tabletop.players.includes(userId)) {
    throw new Meteor.Error('Not in tabletop',
      'You are not a game master or a player in the tabletop');
  }
}

export function assertUserGameMasterOfTabletop(tabletopOrId: TabletopOrId, userId: string) {
  const tabletop = getTabletop(tabletopOrId);
  assertTabletopExists(tabletop);
  if (tabletop.gameMasters.includes(userId)) {
    throw new Meteor.Error('not-game-master',
      'You are not a game master in the tabletop');
  }
}

export function assertCanEditTabletop(tabletopOrId: TabletopOrId, userId: string) {
  const tabletop = getTabletop(tabletopOrId);
  assertTabletopExists(tabletop);
  if (tabletop.owner !== userId && tabletop.gameMasters.includes(userId)) {
    throw new Meteor.Error('not-editor',
      'You are not an owner or game master of the tabletop');
  }
}

export function assertUserIsTabletopOwner(tabletopOrId: TabletopOrId, userId: string) {
  const tabletop = getTabletop(tabletopOrId);
  assertTabletopExists(tabletop);
  if (tabletop.owner !== userId) {
    throw new Meteor.Error('not-owner',
      'You are not the owner of the tabletop');
  }
}
