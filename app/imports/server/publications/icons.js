import Icons from '/imports/api/icons/Icons.js';

Meteor.publish('sampleIcons', function(){
	return Icons.find({}, {limit: 50});
});

Meteor.publish('searchIcons', function(searchValue) {
  // Don't publish anything if there's no search value
  if (!searchValue) {
    return [];
  }
  return Icons.find(
    { $text: {$search: searchValue} },
    {
      // relevant documents have a higher score.
      fields: {
        score: { $meta: 'textScore' }
      },
      // `score` property specified in the projection fields above.
      sort: {
        score: { $meta: 'textScore' }
      }
    }
  );
});
