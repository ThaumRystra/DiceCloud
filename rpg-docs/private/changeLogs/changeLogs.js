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

ChangeLogs.insert({
	version: "0.3.0",
	changes: [
		"Refactored character sheet user interface.",
		"Removed a lot of unneeded effects and webcomponents, should result in significantly improved performance on low-powered devices.",
	],
});

ChangeLogs.insert({
	version: "0.3.1",
	changes: [
		"Re-implemented floating action button menu component to move away from the broken third party implementation.",
	],
});

ChangeLogs.insert({
	version: "0.4.0",
	changes: [
		"Changed attacks to use arbitrary strings with inline calculations",
		"Added item increment and decrement buttons",
		"fixed incorrect line breaks and formatting in dialogs",
		"Added calculated values for jumping and carrying to the strength detail box",
	],
});

ChangeLogs.insert({
	version: "0.4.1",
	changes: [
		"Fixed strength jumping calculations not rounding down correctly",
	],
});

ChangeLogs.insert({
	version: "0.4.2",
	changes: [
		"Fixed attack migrations from 0.3 -> 0.4",
	],
});

ChangeLogs.insert({
	version: "0.5",
	changes: [
		"Fixed a bug that caused multiple resistances or vulnerabilities to combine incorrectly",
		"Added encumbrance effects that automatically apply when carrying too much load",
		"Added a bunch of UI elements to make your character's current load clear",
		"Floating button menus now close as expected when you click a sub-button",
		"Base values in attribute summaries no longer look like added values"
	],
});

ChangeLogs.insert({
	version: "0.5.1",
	changes: [
		"Characters are now cached and should take much faster to load when swapping between them",
	],
});

ChangeLogs.insert({
	version: "0.5.2",
	changes: [
		"Opened the beta up to the general public",
		"Added performance monitoring",
	],
});

ChangeLogs.insert({
	version: "0.5.3",
	changes: [
		"Prevented a harmless error caused by effects which have no stat set",
		"Added the ability to hide the spells tab",
		"Feedback forms now give me push notifications",
		"Feedback forms now won't send unless properly filled out",
		"Overhauled how effects' stats are chosen",
	],
});

ChangeLogs.insert({
	version: "0.5.4",
	changes: [
		"Fixed rounding error on net worth calculation",
	],
});

ChangeLogs.insert({
	version: "0.5.5",
	changes: [
		"Fixed reports from google users not correctly storing the reply-to email address",
	],
});

ChangeLogs.insert({
	version: "0.5.6",
	changes: [
		"Changed front page",
		"Moved to a darker style",
		"Added support for letting characters be viewed by \"anyone with the link\"",
	],
});

ChangeLogs.insert({
	version: "0.5.7",
	changes: [
		"Added proficiencies to backgrounds",
		"Added attacks to spells",
		"Added a move item dialog to mobile devices, but it can't be accessed yet, because long-presses are broken",
	],
});

ChangeLogs.insert({
	version: "0.6.0",
	changes: [
		"Big performance improvements: loading characters that you've viewed recently and changing effects on characters should be much faster",
		"Spell dialogs no longer show their casting time, range, etc. if those fields aren't filled in",
		"The settings dialog now has a done button so it can be closed on small devices",
		"Container dialogs now have the weight summaries rounded down properly",
	],
});

ChangeLogs.insert({
	version: "0.6.1",
	changes: [
		"Experience dialogs should update their edit-mode inputs properly now",
	],
});

ChangeLogs.insert({
	version: "0.6.2",
	changes: [
		"Fixed a regression which broke min and max effects",
	],
});

ChangeLogs.insert({
	version: "0.6.3",
	changes: [
		"Fixed a regression that stopped skills and attributes from rounding down correctly",
		"Made dependency loops return NaN immediately, rather than looping indefinitely until a page refresh. Adding an effect that adds \"strength\" to Strength, won't cause Strength to constantly increase or freeze the browser, Strength just becomes NaN",
	],
});

ChangeLogs.insert({
	version: "0.6.4",
	changes: [
		"Hit dice now has a \"+\" between the dice and the constitution modifier",
		"Items with multiple attacks should have the damage type editable on all attacks now",
		"Spell attacks should now correctly inherit changes to their spell's name",
		"Character lists should now be ordered alphabetically",
		"Skills should have correct min and max effects applied again",
	],
});

ChangeLogs.insert({
	version: "0.6.5",
	changes: [
		"Net worth now takes container values into account",
		"Added support for character pictures",
		"Disabled edit buttons for read-only viewers",
	],
});

ChangeLogs.insert({
	version: "0.6.6",
	changes: [
		"Text fields now accept github-flavor markdown formatting",
	],
});

ChangeLogs.insert({
	version: "0.6.7",
	changes: [
		"Fixed effect values not being visible on small screens",
		"Added basic analytics",
	],
});
