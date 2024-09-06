
import SimpleSchema from 'simpl-schema';
import { incrementFileStorageUsed } from '/imports/api/users/methods/updateFileStorageUsed';
import { CreaturePropertySchema } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { CreatureSchema } from '/imports/api/creature/creatures/Creatures';
import assertUserHasFileSpace from '/imports/api/files/assertUserHasFileSpace';
let createS3FilesCollection;
if (Meteor.isServer) {
  createS3FilesCollection = require('/imports/api/files/server/s3FileStorage').createS3FilesCollection
} else {
  createS3FilesCollection = require('/imports/api/files/client/s3FileStorage').createS3FilesCollection
}

const ArchiveCreatureFiles = createS3FilesCollection({
  collectionName: 'archiveCreatureFiles',
  storagePath: Meteor.isDevelopment ? '../../../../../fileStorage/archiveCreatures' : 'assets/app/archiveCreatures',
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in json format
    if (file.size > 10485760) {
      return 'Please upload with size equal or less than 10MB';
    }
    // Make sure the user has enough space
    assertUserHasFileSpace(Meteor.userId(), file.size);
    // Only accept JSON
    if (!/json/i.test(file.extension)) {
      return 'Please upload only a JSON file';
    }
    return true;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) incrementFileStorageUsed(file.userId, file.size);
  }
});

let archiveSchema = new SimpleSchema({
  meta: {
    type: Object,
    blackbox: true,
  },
  creature: CreatureSchema,
  properties: {
    type: Array,
  },
  'properties.$': CreaturePropertySchema,
  experiences: {
    type: Array,
  },
  'experiences.$': {
    type: Object,
    blackbox: true,
  },
  logs: {
    type: Array,
  },
  'logs.$': {
    type: Object,
    blackbox: true,
  },
});

export default ArchiveCreatureFiles;
export { archiveSchema };
