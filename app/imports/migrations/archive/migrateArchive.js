import migrateTo1 from './migrateArchiveTo1';
import migrate1To2 from './migrateArchive1To2';
import migrate2To3 from './migrateArchive2To3';
import cleanAtCurrent from './cleanArchiveAtCurrent';

/* eslint no-fallthrough: "off" -- Using switch fallthrough to run all
migration steps after the current version of the file. */
export default function migrateArchive(archive) {
  switch (archive.meta.schemaVersion) {
    // V1 of DiceCloud
    case 'version1':
      migrateLegacyArchive(archive);
    // V2 of DiceCloud, Schema version 1
    case 1:
      migrateTo1(archive);
      migrate1To2(archive);
    // V2 of DiceCloud, Schema version 2
    case 2:
      migrate2To3(archive);
    case 3:
      cleanAtCurrent(archive);
      break;
    default:
      throw 'Archive version not supported';
  }
}

function migrateLegacyArchive() {
  // TODO:
  throw 'Not implemented';
}
