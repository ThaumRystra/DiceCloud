//schema to store all effects which expire and their expiry dates
Schemas.Expiration = new SimpleSchema({
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!this.isSet) return Random.id();
		}},
	stat:      { type: String },
	effectIds: { type: [String], regEx: SimpleSchema.RegEx.Id },
  featureIds:{ type: [String], regEx: SimpleSchema.RegEx.Id },
	expiry:    { type: Number }
});
