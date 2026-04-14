
import SimpleSchema from 'simpl-schema';
import { incrementFileStorageUsed } from '/imports/api/users/methods/updateFileStorageUsed';
import { CreaturePropertySchema } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { CreatureSchema } from '/imports/api/creature/creatures/Creatures';
import assertUserHasFileSpace from '/imports/api/files/assertUserHasFileSpace';
const s3FilesStorage = Meteor.isServer
  ? await import('../../files/server/s3FileStorage')
  : await import('../../files/client/s3FileStorage');

const ArchiveCreatureFiles = s3FilesStorage.createS3FilesCollection({
  collectionName: 'archiveCreatureFiles',
  storagePath: Meteor.isDevelopment ? '../../../../../fileStorage/archiveCreatures' : 'assets/app/archiveCreatures',
  async onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in json format
    if (file.size > 10485760) {
      return 'Please upload with size equal or less than 10MB';
    }
    // Make sure the user has enough space
    await assertUserHasFileSpace(Meteor.userId(), file.size);
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

const archiveSchema = new SimpleSchema({
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
