import Attacks from "/imports/api/creature/Attacks.js";
import Buffs from "/imports/api/creature/Buffs.js";
import Classes from "/imports/api/creature/Classes.js";
import CustomBuffs from "/imports/api/creature/CustomBuffs.js";
import Effects from "/imports/api/creature/Effects.js";
import Experiences from "/imports/api/creature/Experiences.js";
import Features from "/imports/api/creature/Features.js";
import Notes from "/imports/api/creature/Notes.js";
import Proficiencies from "/imports/api/creature/Proficiencies.js";
import SpellLists from "/imports/api/creature/SpellLists.js";
import Spells from "/imports/api/creature/Spells.js";
import Containers from "/imports/api/inventory/Containers.js";
import Items from "/imports/api/inventory/Items.js";

Meteor.startup(() => {
	const collections = [
		Attacks, Buffs, Classes, CustomBuffs, Effects, Experiences,
		Features, Notes, Proficiencies, SpellLists, Spells,
		Containers, Items,
	];

	/**
	 * Deletes all soft removed documents that were removed more than 30 minutes ago
	 * and were not restored
	 * @return {Number} Number of documents removed
	 */
	const deleteOldSoftRemovedDocs = function(){
		let numRemoved = 0;
		const now = new Date();
		const thirtyMinutesAgo = new Date(now.getTime() - 30*60000);
		_.each(collections, (collection) => {
			numRemoved += collection.remove({
				removed: true,
				removedAt: {$lt: thirtyMinutesAgo} // dates *before* 30 minutes ago
			});
		});
		return numRemoved;
	};

	SyncedCron.add({
		name: "Delete all soft removed items that haven't been restored",
		schedule: function(parser) {
			return parser.text('every 6 hours');
		},
		job: function() {
			deleteOldSoftRemovedDocs();
		}
	});

	// Add a method to manually trigger removal
	Meteor.methods({
		deleteOldSoftRemovedDocs() {
			const user = Meteor.users.findOne(this.userId);
			if (user && _.contains(user.roles, "admin")){
				return deleteOldSoftRemovedDocs();
			}
		},
	});
});
