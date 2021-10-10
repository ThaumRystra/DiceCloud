import Tabletops from '../../Tabletops.js';

export function assertUserInTabletop(tabletopId, userId){
  let tabletop = Tabletops.findOne(tabletopId);
  if (!tabletop){
    throw new Meteor.Error('Tabletop does not exist',
    'No tabletop could be found for the given tabletop id');
  }
  if (tabletop.gameMaster !== userId && !tabletop.players.includes(userId)){
    throw new Meteor.Error('Not in tabletop',
    'The user is not the gamemaster or a player in the given tabletop');
  }
}

export function assertUserIsTabletopOwner(tabletopId, userId){
  let tabletop = Tabletops.findOne(tabletopId);
  if (!tabletop){
    throw new Meteor.Error('Tabletop does not exist',
    'No tabletop could be found for the given tabletop id');
  }
  if (tabletop.gameMaster !== userId){
    throw new Meteor.Error('Not the owner',
    'The user is not the owner of the given tabletop');
  }
}
