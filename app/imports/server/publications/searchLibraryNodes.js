import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds.js';
import getUserLibraryIds from '/imports/api/library/getUserLibraryIds.js';
import { assertViewPermission } from '/imports/api/sharing/sharingPermissions.js';

Meteor.publish('selectedLibraryNodes', function(selectedNodeIds){
  check(selectedNodeIds, Array);
  // Limit to 20 selected nodes
  if (selectedNodeIds.length > 20){
    selectedNodeIds = selectedNodeIds.slice(0, 20);
  }
  let libraryViewPermissions = {};
  // Check view permissions of all libraries
  for (let id of selectedNodeIds){
    let node = LibraryNodes.findOne(id);
    if (!node) continue;
    let libraryId = node.ancestors[0].id;
    if (libraryViewPermissions[id]){
      continue;
    } else {
      let library = Libraries.findOne(libraryId, {fields: {
        owner: 1,
        readers: 1,
        writers: 1,
        public: 1,
      }});
      assertViewPermission(library, this.userId);
      libraryViewPermissions[id] = true;
    }
  }
  // Return all nodes and their children
  return [LibraryNodes.find({
    $or: [
      {_id: {$in: selectedNodeIds}},
      {'ancestors.id': {$in: selectedNodeIds}},
    ],
  })];
});

Meteor.publish('searchLibraryNodes', function(creatureId){
  let self = this;
  this.autorun(function (){
    let type = self.data('type');
    if (!type) return [];

    let userId = this.userId;
    if (!userId) {
      return [];
    }

    // Get all the ids of libraries the user can access
    let libraryIds;
    if (creatureId) {
      libraryIds = getCreatureLibraryIds(creatureId, userId)
    } else {
      libraryIds = getUserLibraryIds(userId)
    }

    // Build a filter for nodes in those libraries that match the type
    let filter = {
      'ancestors.id': {$in: libraryIds},
      removed: {$ne: true},
      tags: {$ne: []}, // Only tagged library nodes are considered
    };
    if (type){
      filter.$or = [{
          type,
        },{
          type: 'slotFiller',
          slotFillerType: type,
      }];
    }

    this.autorun(function(){
      // Get the limit of the documents the user can fetch
      var limit = self.data('limit') || 32;
      check(limit, Number);

      // Get the search term
      let searchTerm = self.data('searchTerm') || '';
      check(searchTerm, String);

      
      let options = {
        sort: {
          'ancestors.0.id': 1,
          name: 1,
          order: 1,
        },
        limit: limit,
      };
    
      // Reset the resultSet
      let allNodes = LibraryNodes.find().fetch();
      resultSet = new Set(allNodes.map(node => node._id));
    
      if (filter._id) {
        delete filter._id;
      }

      if (searchTerm) {
        const orTerms = searchTerm.split('|').map(term => term.trim()).filter(term => term.length > 0);
        const andTerms = searchTerm.replace('|',' ').split('&').map(term => term.trim()).filter(term => term.length > 0 && !orTerms.includes(term));
        
        if (orTerms.length > 0) {
          resultSet = new Set();
          orTerms.forEach(term => {
            const result = searchNodes(term, filter, options);
            result.forEach(id => resultSet.add(id));
          });
        }
    
        if (andTerms.length > 0) {
          let andResults = andTerms.map(term => searchNodes(term, filter, options));
          resultSet = andResults.shift();
          andResults.forEach(result => {
            resultSet = new Set([...resultSet].filter(id => result.has(id)));
          });
        }
        
        delete filter.$text;
        filter._id = { $in: [...resultSet] };
      
        options.limit = limit;
        
        if (orTerms.length > 0 || andTerms.length > 0) {
          if (resultSet.size > 0) {
            filter._id = { '$in': Array.from(resultSet) };
          } else {
            // No results found, ensure no documents are returned
            filter._id = { '$in': ['non-existent-id'] };
          }
        }
      }

      this.autorun(function () {
        self.setData('countAll', LibraryNodes.find(filter).count());
      });

      let cursor = LibraryNodes.find(filter, options);
      const libraries = Libraries.find({ _id: { $in: libraryIds } });

      Mongo.Collection._publishCursor(libraries, self, 'libraries');

      let observeHandle = cursor.observeChanges({
          added: function (id, fields) {
            fields._searchResult = true;
            self.added('libraryNodes', id, fields);
          },
          changed: function (id, fields) {
            self.changed('libraryNodes', id, fields);
          },
          removed: function (id) {
            self.removed('libraryNodes', id);
          }
        },
        // Publications don't mutate the documents
        { nonMutatingCallbacks: true }
      );

      // register stop callback (expects lambda w/ no args).
      this.onStop(function () {
        observeHandle.stop();
      });
      // this.ready();
    });
  });
});

function searchNodes(term, filter, options) {
  if (!term) return new Set();

  filter.$text = { $search: term };
  const cursor = LibraryNodes.find(filter, options);
  const resultSet = new Set();
  cursor.forEach(doc => resultSet.add(doc._id));

  return resultSet;
}
