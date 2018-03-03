let tabPages, tabSliders, tabFabs, tabFabMenus;
Template.characterSheet.onRendered(function() {
	//default to the stats tab
	Session.setDefault(this.data._id + ".selectedTab", "0");

	// Keep the header's scroll target up to date with the currently selected tab
	let header;
	this.autorun(() => {
		const tab = getTab(Template.currentData()._id);
		header = header || this.find("app-header");
		if (!header) return;
		Tracker.afterFlush(() => {
			header.scrollTarget = this.find("#tabPages .iron-selected");
			header._scrollHandler && header._scrollHandler();
		});
	});

	_.defer(() => {
		// Store all the tab page components for use in animations
		tabPages = _.times(6, (n) =>
			this.$(`.tab-page:nth-child(${n + 1})`)
		);
		tabSliders = _.times(6, (n) =>
			tabPages[n].find(".animation-slider")
		);
		tabFabs = _.times(6, (n) =>
			tabPages[n].find(".floatyButton")
		);
		tabFabMenus = _.times(6, (n) =>
			tabPages[n].find(".mini-holder")
		);
	});

	//watch this character and make sure their encumbrance is updated
	//trackEncumbranceConditions(this.data._id, this);
});

/**
 * Page change animations that suck less than neon-animated-pages
 */
const tabAnimation = ({oldTab, newTab, duration}) => {
	if (newTab === oldTab) return;
	duration = duration || 400;
	const delay = (element, f) => {
		element.on(
			"transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
			(event) => {
				if (event.target == event.currentTarget){
					f();
					$(this).off(event);
				}
			}
		);
	}
	const isForward = newTab > oldTab;
	const entryAnimation = {
		before: {
			transform: isForward ? "translateX(100%)" : "translateX(-100%)",
		},
		during: {
			transition: `transform ${duration}ms ease`,
			transform: "",
		},
		after: {
			transition: "",
			transform: "",
		},
	}
	const exitAnimation = {
		before: {
			transform: "translateZ(0)",
		},
		during: {
			transition: `transform ${duration}ms ease`,
			transform: isForward ? "translateX(-100%)" : "translateX(100%)",
		},
		after: {
			transition: "",
			transform: "",
			display: "",
		},
	}
	const oldPage = tabPages[oldTab];
	const newPage = tabPages[newTab];
	if (oldPage.length && newPage.length){
		oldPage[0].style.setProperty("display", "initial", "important");
		oldPage.css({zIndex: "1"});
		newPage.css({zIndex: "0"});
		_.defer(() => {
			oldPage.css({
				transition: `z-index ${duration}ms linear`,
				zIndex: "0",
			});
			newPage.css({
				transition: `z-index ${duration}ms linear`,
				zIndex: "1",
			});
		});
		delay(oldPage, () => oldPage.css({
			display: "",
			transition: "",
			zIndex: "",
		}));
		delay(newPage, () => newPage.css({
			transition: "",
			zIndex: "",
		}));
	}
	const oldSlider = tabSliders[oldTab];
	if (oldSlider.length){
		oldSlider.css(exitAnimation.before);
		_.defer(() => oldSlider.css(exitAnimation.during));
		delay(oldSlider, () => oldSlider.css(exitAnimation.after));
	}
	const newSlider = tabSliders[newTab];
	if (newSlider.length){
		newSlider.css(entryAnimation.before);
		_.defer(() => newSlider.css(entryAnimation.during));
		delay(newSlider, () => newSlider.css(entryAnimation.after));
	}
	slideDown = ({element, reverse}) => {
		element.css({
			transform: reverse ? "translateY(80px)" : "",
		});
		const fraction = duration / 4;
		_.defer(() => element.css({
			transition: reverse ?
				`transform ${fraction}ms ease-out ${duration - fraction}ms` :
				`transform ${fraction}ms ease-in`,
			transform: reverse ? "" : "translateY(80px)",
		}));
		delay(element, () => element.css({
			transition: "",
		}));
	}

	const oldFab = tabFabs[oldTab];
	const newFab = tabFabs[newTab];
	if (oldFab.length && !newFab.length){
		slideDown({element: oldFab});
	}
	if (newFab.length && !oldFab.length){
		slideDown({element: newFab, reverse: true});
	}
	if (newFab.length && oldFab.length){
		newFab.css({transform: ""});
	}

	const oldFabMenu = tabFabMenus[oldTab];
	if (oldFabMenu.length) {
		Blaze.getView(oldFabMenu[0]).templateInstance().active.set(false);
	}
}

var setTab = function(charId, tab){
	tabAnimation({
		oldTab: +Session.get(charId + ".selectedTab"),
		newTab: +tab,
	});
	return Session.set(charId + ".selectedTab", tab);
};

var getTab = function(charId){
	return Session.get(charId + ".selectedTab");
};

Template.characterSheet.helpers({
	printing: function(){
		return Session.get("isPrinting");
	},
	printUrl: function(){
		return `/character/${this._id}/${this.name || "-"}/print`
	},
	selectedTab: function(){
		return getTab(this._id);
	},
	hideSpellcasting: function() {
		var char = Characters.findOne(this._id);
		return char && char.settings.hideSpellcasting;
	},
	newUserExperience: function(){
		var char = Characters.findOne(this._id);
		return char && char.settings.newUserExperience;
	},
	shouldBounce: function(tab){
		const selected = Session.get(this._id + ".selectedTab")
		const step = Session.get("newUserExperienceStep");
		if (selected == tab) return false;
		return (tab === 1 && step === 0) ||
			(tab === 5 && step === 1) ||
			(tab === 0 && step === 2);
	},
});

Template.characterSheet.events({
	"iron-select #characterSheetTabs": function(event, instance){
		setTab(this._id, event.target.selected);
	},
	"color-change": function(event, instance){
		console.log("character color change")
		Characters.update(this._id, {$set: {color: event.color}});
	},
	"click #deleteCharacter": function(event, instance){
		pushDialogStack({
			data: this,
			template: "deleteCharacterConfirmation",
			element: event.currentTarget.parentElement.parentElement,
			callback: (result) => {
				if (result === true){
					Router.go("/characterList");
					Tracker.afterFlush(() => Characters.remove(this._id));
				}
			},
		});
	},
	"click #shareCharacter": function(event, instance){
		pushDialogStack({
			data: this,
			template: "shareDialog",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
	"click #characterSettings": function(event, instance){
		pushDialogStack({
			data: this,
			template: "characterSettings",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
	"click #characterExport": function(event, instance){
		pushDialogStack({
			data: this,
			template: "exportDialog",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
	"click #unshareCharacter": function(event, instance){
		pushDialogStack({
			data: this,
			template: "unshareCharacterConfirmation",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
});
