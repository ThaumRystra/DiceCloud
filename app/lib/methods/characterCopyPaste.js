// Uses '/lib/functions/backupRestoreCharacter.js' to do most the work

Meteor.methods({
	copyCharacter: function(charId) {
		const userId = Meteor.userId();
    let character = Characters.findOne(charId);

    // Need at least view level permission to make a copy for yourself
		if (!canViewCharacter(character, userId)) return;

    let characterDump = dumpCharacter(charId);
    giveCharacterDumpNewIds(characterDump);

    // Remove all readers and writers, make this user the new owner
    characterDump.character.readers = [];
    characterDump.character.writers = [];
    characterDump.character.owner = userId;

    // Write the character back to the database
    restoreCharacter(characterDump);
	},
});
