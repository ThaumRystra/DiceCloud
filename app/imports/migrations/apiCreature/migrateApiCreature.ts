import migrate2To3 from './migrateApiCreature2To3';
import cleanAtCurrent from './cleanApiCreatureAtCurrent';

/* eslint no-fallthrough: "off" -- Using switch fallthrough to run all
migration steps after the current version of the file. */
export default function migrateApiCreature(apiCreature) {
  const apiVersion = apiCreature.meta?.schemaVersion ?? 2;
  switch (apiVersion) {
    case 'version1':
    case 1:
      throw new Meteor.Error('not-supported', 'Importing characters is not supported for the version of the linked instance of DiceCloud')
    case 2:
      migrate2To3(apiCreature);
    case 3:
      cleanAtCurrent(apiCreature);
      break;
    default:
      throw 'Archive version not supported';
  }
}
