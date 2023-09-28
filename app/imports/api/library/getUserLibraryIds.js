import LibraryCollections from '/imports/api/library/LibraryCollections';
import Libraries from '/imports/api/library/Libraries';
import { union } from 'lodash';

export default function getUserLibraryIds(userId) {
  if (!userId) return [];
  const user = Meteor.users.findOne(userId);
  let subbedIds = user?.subscribedLibraries || [];
  const subCollections = user?.subscribedLibraryCollections || [];
  LibraryCollections.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: subCollections }, public: true },
    ]
  }, { fields: { libraries: 1 } }).forEach(collection => {
    subbedIds = union(subbedIds, collection.libraries);
  });
  const libraryIds = Libraries.find({
    $or: [
      { owner: userId },
      { writers: userId },
      { readers: userId },
      { _id: { $in: subbedIds }, public: true },
    ]
  }, {
    fields: { _id: 1 }
  }).map(lib => lib._id);
  return libraryIds;
}