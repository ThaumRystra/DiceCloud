import SimpleSchema from 'simpl-schema';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { assertViewPermission, assertDocViewPermission } from '/imports/api/sharing/sharingPermissions.js';

const LIBRARY_NODE_TREE_FIELDS = {
  _id: 1,
  name: 1,
  type: 1,
  icon: 1,
  color: 1,
  order: 1,
  parent: 1,
  ancestors: 1,
  // Effect
  operation: 1,
  targetTags: 1,
  stats: 1,
  // Item
  quantity: 1,
  plural: 1,
  equipped: 1,
  // Branch
  branchType: 1,
  // Damage:
  damageType: 1,
  stat: 1,
  amount: 1,
  // Class level
  level: 1,
  // Proficiency
  value: 1,
  // Reference
  cache: 1,
}

export { LIBRARY_NODE_TREE_FIELDS };

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
        sort: { order: 1 },
        fields: LIBRARY_NODE_TREE_FIELDS,
      }),
    ];
  });
});

const nodeIdSchema = new SimpleSchema({
  libraryNodeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('libraryNode', function (libraryNodeId) {
  if (!libraryNodeId) return [];
  nodeIdSchema.validate({ libraryNodeId });
  this.autorun(function () {
    const userId = this.userId;
    const nodeCursor = LibraryNodes.find({_id: libraryNodeId});
    let node = nodeCursor.fetch()[0];
    try { assertDocViewPermission(node, userId) }
    catch (e) {
      return this.error(e);
    }
    return [ nodeCursor ];
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
