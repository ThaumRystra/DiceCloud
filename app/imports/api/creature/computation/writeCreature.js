
function writeCreature(char) {
  //TODO these functions don't filter the stats before trying to write
  writeAttributes(char);
  writeSkills(char);
  writeDamageMultipliers(char);
  writeEffects(char);
}

/*
 * Write all the attributes from the in-memory char object to the Attirbute docs
 */
function writeAttributes(char) {
  let bulkWriteOps = _.map(char.atts, (att, variableName) => {
    let op = {
      updateMany: {
        filter: {'ancestors.id': char.id, variableName},
        update: {'$set': {
          value: att.result,
          rollBonuses: skill.rollBonus,
        }},
      }
    };
    if (typeof att.mod === 'number'){
      op.updateMany.update.$set.mod = att.mod;
    } else {
      op.updateMany.update.$unset = {mod: 1};
    }
    return op;
  });
  bulkWriteProperties({bulkWriteOps, selectorType: 'attribute'});
}

function writeSkills(char) {
  let bulkWriteOps =  _.map(char.skills, (skill, variableName) => {
    let op = {
      updateMany: {
        filter: {'ancestors.id': char.id, variableName},
        update: {$set: {
          value: skill.result,
          abilityMod: skill.abilityMod,
          advantage: skill.advantage,
          passiveBonus: skill.passiveAdd,
          proficiency: skill.proficiency,
          conditionalBenefits: skill.conditional,
          rollBonuses: skill.rollBonus,
          fail: skill.fail,
        }},
      }
    };
    return op;
  });
  bulkWriteProperties({bulkWriteOps, selectorType: 'skill'});
}

function writeDamageMultipliers(char) {
  let bulkWriteOps =  _.map(char.dms, (dm, variableName) => {
    let op = {
      updateMany: {
        filter: {'ancestors.id': char.id, variableName},
        update: {$set: {
          value: dm.result,
        }},
      }
    };
    return op;
  });
  bulkWriteProperties({bulkWriteOps, selectorType: 'damageMultiplier'});
}

function writeEffects(char){
  let bulkWriteOps =  _.map(char.computedEffects, effect => ({
    updateOne: {
      filter: {_id: effect._id},
      update: {$set: {
        result: effect.result,
      }},
    },
  }));
  if (!bulkWriteOps.length) return;
  bulkWriteProperties({bulkWriteOps, selectorType: 'effect'});
}

function bulkWriteProperties({bulkWriteOps, selectorType}){
  if (!bulkWriteOps.length) return;
  if (Meteor.isServer){
    CreatureProperties.rawCollection().bulkWrite(bulkWriteOps, {ordered : false}, function(e){
      if (e) console.error(e);
    });
  } else {
    _.each(bulkWriteOps, op => {
      CreatureProperties.update(op.updateMany.filter, op.updateMany.update, {
        multi: true,
        selector: {type: selectorType}
      });
    });
  }
}
