import SimpleSchema from 'simpl-schema';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';

const standardLibraryIds = [
  'SRDLibraryGA3XWsd',
];

Meteor.publish('standardLibraries', function(){
  return Libraries.find({_id: {$in: standardLibraryIds}});
});

Meteor.publish('libraries', function(){
  this.autorun(function (){
    if (!this.userId) {
      return this.ready();
    }
    const user = Meteor.users.findOne(this.userId, {
      fields: {subscribedLibraries: 1}
    });
    const subs = user && user.subscribedLibraries || [];
    return Libraries.find({
      $or: [
        {owner: this.userId},
        {writers: this.userId},
        {readers: this.userId},
        {_id: {$in: subs}},
      ]
    });
  });
});

let libraryIdSchema = new SimpleSchema({
  libraryId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('library', function(libraryId){
  libraryIdSchema.validate({libraryId});
  this.autorun(function (){
    let libraryCursor
    if (this.userId) {
      libraryCursor = Libraries.find({
        _id: libraryId,
        $or: [
          {owner: this.userId},
          {writers: this.userId},
          {readers: this.userId},
          {public: true},
        ],
      });
    } else {
      libraryCursor = Libraries.find({
        _id: libraryId,
        public: true,
      });
    }
    if (!libraryCursor.count()) return this.ready();
    return [
      libraryCursor,
      LibraryNodes.find({
        'ancestors.id': libraryId,
      }),
    ];
  });
});
