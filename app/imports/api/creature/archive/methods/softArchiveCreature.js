import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import Experiences from '/imports/api/creature/experience/Experiences';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

function removeRelatedDocuments(creatureId) {
  CreatureVariables.remove({ _creatureId: creatureId });
  CreatureProperties.remove(getFilter.descendantsOfRoot(creatureId));
  CreatureLogs.remove({ creatureId });
  Experiences.remove({ creatureId });
}

export function toSoftArchive(creatureId, archiveId) {
  if (!Meteor.isServer) return;

  Creatures.update(
    { _id: creatureId },
    {
      $set: {
        archiveId: archiveId,
      },
    }
  );
  removeRelatedDocuments(creatureId);
}
