var childSchema = new SimpleSchema({
	parent:              { type: Object },
	'parent.collection': { type: String },
	'parent.id':         { type: String, regEx: SimpleSchema.RegEx.Id },
	'removedWith':       { optional: true, type: String, regEx: SimpleSchema.RegEx.Id },
});

var joinWithDefaultKeys = function(keys){
	var defaultKeys = [
		'charId',
	];
	return _.union(keys, defaultKeys);
};

var limitModifierToKeys = function(modifier, keys){
	if(!modifier) return;
	modifier = _.pick(modifier, ['$set', '$unset']);
	if(modifier.$set) modifier.$set   = _.pick(modifier.$set,   keys);
	if(modifier.$unset) modifier.$unset = _.pick(modifier.$unset, keys);
	if(_.isEmpty(modifier.$set))   delete modifier.$set;
	if(_.isEmpty(modifier.$unset)) delete modifier.$unset;
	return modifier;
};

var getParent = function(doc){
	if(!doc || !doc.parent) return;
	var parentCol = Meteor.isClient?
		window[doc.parent.collection] : global[doc.parent.collection];
	if (parentCol)
		return parentCol.findOne(doc.parent.id, {removed: true});
};

var inheritParentProperties = function(doc, collection){
	var parent = getParent(doc);
	if(!parent) throw new Meteor.Error('Parenting Error', 'Document\'s parent does not exist');
	var handMeDowns = _.pick(parent, collection.inheritedKeys);
	if(_.isEmpty(handMeDowns)) return;
	collection.update(doc._id, {$set: handMeDowns});
};

var childCollections = [];

makeChild = function(collection, inheritedKeys){
	inheritedKeys = inheritedKeys || [];
	if(inheritedKeys) collection.inheritedKeys = joinWithDefaultKeys(inheritedKeys);
	collection.helpers({
		//returns the parent even if it's removed
		getParent: function(){
			return getParent(this);
		},
		getParentCollection: function(){
			return Meteor.isClient?
				window[this.parent.collection] : global[this.parent.collection];
		}
	});

	//when created, inherit parent properties
	collection.after.insert(function(userId, doc){
		inheritParentProperties(doc, collection);
	});

	collection.before.update(function(userId, doc, fieldNames, modifier, options){
		//if we are restoring this asset, unmark that it was removed with its parent, we no longer care
		if( modifier && modifier.$unset && modifier.$unset.removed){
			modifier.$unset.removedWith = "";
		}
	});

	if(Meteor.isClient) collection.after.update(function (userId, doc, fieldNames, modifier, options) {
		if(modifier && modifier.$set && modifier.$set.parent){
			//when we change parents, inherit its properties
			inheritParentProperties(doc, collection);
		}
	});

	collection.softRemoveNode = collection.softRemoveNode || function(id){
		collection.softRemove(id);
	};

	collection.restoreNode = collection.restoreNode || function(id){
		collection.restore(id);
	};

	collection.attachSchema(childSchema);

	childCollections.push(collection);
};

makeParent = function(collection, donatedKeys){
	donatedKeys = joinWithDefaultKeys(donatedKeys);
	var collectionName = collection._collection.name;
	//after changing, push the changes to all children
	if(Meteor.isClient) collection.after.update(function (userId, doc, fieldNames, modifier, options) {
		modifier = limitModifierToKeys(modifier, donatedKeys);
		doc = _.pick(doc, ['_id','charId']);
		if(!modifier) return;
		Meteor.call('updateChildren', doc, modifier, true);
	});

	collection.softRemoveNode = function(id){
		Meteor.call('softRemoveNode', collectionName, id);
	};

	collection.restoreNode = function(id){
		Meteor.call('restoreNode', collectionName, id);
	};

	if(Meteor.isServer) collection.after.remove(function (userId, doc) {
		_.each(childCollections, function(collection){
			collection.remove(
				{'parent.id': doc._id}
			);
		});
	});
};

var checkPermission = function(userId, charId){
	var char = Characters.findOne( charId, { fields: {owner: 1, writers: 1} } );
	if(!char)
		throw new Meteor.Error('Access Denied, no charId',
							   'Character '+charId+' does not exist');
	if (!userId)
		throw new Meteor.Error('Access Denied, no userId',
							   'No UserId set when trying to update character asset.');
	if (char.owner !== userId && !_.contains(char.writers, userId))
		throw new Meteor.Error('Access Denied, not permitted',
							   'Not permitted to update assets of this character.');
	return true;
};

var cascadeSoftRemove = function(id, removedWithId){
	_.each(childCollections, function(treeCollection){
		treeCollection.update({"parent.id": id}, {$set: {removed: true, removedWith: removedWithId}});
		treeCollection.find({"parent.id": id}).forEach(function(doc){
			cascadeSoftRemove(doc._id, removedWithId);
		});
	});
};

var checkRemovePermission = function(collectionName, id, self){
	check(collectionName, String);
	check(id, String);
	var collection = Mongo.Collection.get(collectionName);
	var node = collection.findOne(id);
	var charId = node && node.charId;
	checkPermission(self.userId, charId);
};

Meteor.methods({
	softRemoveNode: function(collectionName, id){
		checkRemovePermission(collectionName, id, this);
		var collection = Mongo.Collection.get(collectionName);
		collection.softRemove(id);
		cascadeSoftRemove(id, id);
	},
	restoreNode: function(collectionName, id){
		checkRemovePermission(collectionName, id, this);
		var collection = Mongo.Collection.get(collectionName);
		collection.restore(id);
		_.each(childCollections, function(treeCollection){
			treeCollection.update({removedWith: id, removed: true}, { $unset: {removed: true, removedWith: ""} });
		});
	},
	updateChildren: function (parent, modifier, limitToInheritance) {
		check(parent, {_id: String, charId: String});
		check(modifier, Object);
		checkPermission(this.userId, parent.charId);
		var selector = {'parent.id': parent._id};
		_.each(childCollections, function(collection){
			var thisModifier;
			if(limitToInheritance){
				thisModifier = limitModifierToKeys(modifier, collection.inheritedKeys);
			} else{
				thisModifier = _.clone(modifier);
			}
			if(_.isEmpty(thisModifier)) return;
			collection.update( selector, thisModifier, {multi: true, removed: true});
		});
	},

	cloneChildren: function (objectId, newParent){
		check(objectId, String);
		check(newParent, {id: String, collection: String});

		_.each(childCollections, function(collection){
			var keys = collection.simpleSchema().objectKeys();
			collection.find({'parent.id': objectId}).forEach(function(doc){
				var newDoc = _.pick( doc, keys);
				newDoc.parent = newParent;
				collection.insert(newDoc);
			});
		});
	}
});
