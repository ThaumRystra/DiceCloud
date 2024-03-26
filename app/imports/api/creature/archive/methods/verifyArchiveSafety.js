import { slice } from 'lodash';
import { PER_CREATURE_LOG_LIMIT } from '/imports/api/creature/log/CreatureLogs';

export default function verifyArchiveSafety({ creature, properties, experiences, logs }) {
  const creatureId = creature._id;

  // Check lengths of arrays
  if (logs.length > PER_CREATURE_LOG_LIMIT) {
    logs = slice(logs, 0, PER_CREATURE_LOG_LIMIT);
  }

  // Check that everything belongs to the right creature
  logs.forEach(log => {
    if (log.creatureId !== creatureId) {
      throw new Meteor.Error('Malicious log', 'Log contains an entry for the wrong creature');
    }
  });
  experiences.forEach(experience => {
    if (experience.creatureId !== creatureId) {
      throw new Meteor.Error('Malicious experience', 'Experiences contains an entry for the wrong creature');
    }
  });
  properties.forEach(prop => {
    if (prop.root?.id !== creatureId) {
      throw new Meteor.Error('Malicious prop', 'Properties contains an entry for the wrong creature');
    }
  });
}
