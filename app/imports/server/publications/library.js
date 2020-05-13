import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';

const standardLibraryIds = [
	'SRDLibraryGA3XWsd',
];

Meteor.publish('standardLibraries', function(){
	return Libraries.find({_id: {$in: standardLibraryIds}});
});

Meteor.publish('libraries', function(){
  if (!this.userId) return [];
	const user = Meteor.user();
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

Meteor.publish('library', function(libraryId){
	if (!this.userId) return [];
	let libraryCursor = Libraries.find({
		_id: libraryId,
		$or: [
			{owner: this.userId},
			{writers: this.userId},
			{readers: this.userId},
      {public: true},
		],
	});
	if (!libraryCursor.count()) return [];
	return [
		libraryCursor,
		LibraryNodes.find({
			'ancestors.id': libraryId,
		}),
	];
});
