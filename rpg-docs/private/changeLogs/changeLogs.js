ChangeLogs.insert({
	version: "0.2.0 - First public release",
	changes: [
		"Implemented basic sharing",
		"Detail boxes separated into view and edit modes",
		"Spell lists now expand horizontally to make better use of wide screens",
		"Proficiencies separated from effects and text boxes to be their own assets",
		"Added favicons and icons for Android/iOS shortcuts",
		"Changed menu icon from hamburger to dots",
	],
});

ChangeLogs.insert({
	version: "0.2.1",
	changes: [
		"Improved sharing functionality",
		"Sliders no longer jump to a point, they need to be dragged",
		"Added a list of characters to the side bar",
	],
});

ChangeLogs.insert({
	version: "0.2.2",
	changes: [
		"Removed a security vulnerability that allowed users to pretend to be other users",
		"The character list menu item in the side bar now shows up whether you have characters yet or not",
		"Stopped the old proficiency text dialog showing up long after it got depreciated",
	],
});

ChangeLogs.insert({
	version: "0.2.3",
	changes: [
		"Changed spacing and formatting of the intro text on the front page",
	],
});

ChangeLogs.insert({
	version: "0.2.4",
	changes: [
		"Fixed typos in the front page",
		"Fixed character sheet loading indefinitely if the character does not exist",
		"Prevented character sheet crashing and loading forever when a incorectly typed ability modifier variable was used in calculations",
	],
});

ChangeLogs.insert({
	version: "0.2.5",
	changes: [
		"Moved log-in to its own page and added functionality for forgot passwords, verifying email addresses and general user accounts improvements",
	],
});

ChangeLogs.insert({
	version: "0.2.6",
	changes: [
		"Re-wrote how item dragging and dropping works to allow items to be dragged to characters in the side bar, and to containers on characters in other tabs and even other windows.",
		"Fixed how splitting stacks works. Stacks should now split and merge properly when ctrl-dragged around",
	],
});

ChangeLogs.insert({
	version: "0.2.7",
	changes: [
		"Added a quick feedback form",
		"Improved the formatting of the side-bar's list of characters",
		"Added a change log",
		"Fixed the styling and rounding of some of the detail boxes",
	],
});
