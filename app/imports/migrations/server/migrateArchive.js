import cleanAt1 from '/imports/migrations/server/dbv1/cleanAt1.js';

/* eslint no-fallthrough: "off" -- Using switch fallthrough to run all
migration steps after the current version of the file. */
export default function migrateArchive(archive){
  switch (archive.meta.schemaVersion){
    // V1 of DiceCloud
    case 'version1':
      migrateLegacyArchive(archive);
    // V2 of DiceCloud, Schema version 1
    case 1:
      cleanAt1(archive);
  }
}

function migrateLegacyArchive(archive){
  // TODO:
  throw 'Not implemented';
}
