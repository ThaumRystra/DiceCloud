import SimpleSchema from 'simpl-schema';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { assertViewPermission } from '/imports/api/sharing/sharingPermissions.js';

Meteor.publish('libraries', function(){
  this.autorun(function (){
    let userId = this.userId;
    if (!userId) {
      return [];
    }
    const user = Meteor.users.findOne(userId, {
      fields: {subscribedLibraries: 1}
    });
    const subs = user && user.subscribedLibraries || [];
    return Libraries.find({
      $or: [
        {owner: this.userId},
        {writers: this.userId},
        {readers: this.userId},
        { _id: {$in: subs}, public: true },
      ]
    }, {
      sort: {name: 1}
    });
  });
});

Meteor.publish('library', function(libraryId){
  if (!libraryId) return [];
  libraryIdSchema.validate({libraryId});
  this.autorun(function (){
    let userId = this.userId;
    let library = Libraries.findOne(libraryId);
    try { assertViewPermission(library, userId) }
    catch(e){
      return this.error(e);
    }
    return Libraries.find({
      _id: libraryId,
    });
  });
});

let libraryIdSchema = new SimpleSchema({
  libraryId:{
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('libraryNodes', function(libraryId){
  if (!libraryId) return [];
  libraryIdSchema.validate({libraryId});
  this.autorun(function (){
    let userId = this.userId;
    let library = Libraries.findOne(libraryId);
    try { assertViewPermission(library, userId) }
    catch(e){
      return this.error(e);
    }
    return [
      LibraryNodes.find({
        'ancestors.id': libraryId,
      }, {
        sort: {order: 1},
      }),
    ];
  });
});

Meteor.publish('softRemovedLibraryNodes', function(libraryId){
  if (!libraryId) return [];
  libraryIdSchema.validate({libraryId});
  this.autorun(function (){
    let userId = this.userId;
    let library = Libraries.findOne(libraryId);
    try { assertViewPermission(library, userId) }
    catch(e){
      return this.error(e);
    }
    return [
      LibraryNodes.find({
        'ancestors.0.id': libraryId,
        removed: true,
        removedWith: {$exists: false},
      }, {
        sort: {order: 1},
      }),
    ];
  });
});

Meteor.publish('descendantLibraryNodes', function(nodeId){
  let node = LibraryNodes.findOne(nodeId);
  let libraryId = node?.ancestors[0]?.id;
  if (!libraryId) return [];
  this.autorun(function (){
    let userId = this.userId;
    let library = Libraries.findOne(libraryId);
    try { assertViewPermission(library, userId) }
    catch(e){
      return this.error(e);
    }
    return [
      LibraryNodes.find({
        'ancestors.id': nodeId,
      }, {
        sort: {order: 1},
      }),
    ];
  });
});
