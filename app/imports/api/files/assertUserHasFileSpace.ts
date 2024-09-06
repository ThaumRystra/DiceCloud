import { getUserTier } from '/imports/api/users/patreon/tiers';
import prettyBytes from 'pretty-bytes';

export default function assertUserHasFileSpace(userId: string | null, spaceRequiredInBytes: number) {
  // Get the user
  if (!userId) throw new Meteor.Error('permission-denied', 'No user was provided');
  const user = Meteor.users.findOne(userId, { fields: { fileStorageUsed: 1 } });
  if (!user) throw new Meteor.Error('permission-denied', 'User not found');

  // Work out how much space they have and need
  const fileStorageUsed = user.fileStorageUsed || 0;
  const fileStorageAllowed = getUserTier(Meteor.userId()).fileStorage * 1000000;
  let fileStorageLeft = fileStorageAllowed - fileStorageUsed;
  if (fileStorageLeft < 0) fileStorageLeft = 0;

  // Throw an error if they don't have space
  if (fileStorageLeft < spaceRequiredInBytes) {
    throw new Meteor.Error('insufficient-space',
      `Not enough storage space left, you need ${prettyBytes(spaceRequiredInBytes)}, ` +
      `but only have ${prettyBytes(fileStorageLeft)} available`
    );
  }
}