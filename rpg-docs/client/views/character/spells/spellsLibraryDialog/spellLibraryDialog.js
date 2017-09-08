const librarySubs = new SubsManager();

const categories = [
	{name: "Cantrips", key: 0},
	{name: "Level 1", key: 1},
	{name: "Level 2", key: 2},
	{name: "Level 3", key: 3},
	{name: "Level 4", key: 4},
	{name: "Level 5", key: 5},
	{name: "Level 6", key: 6},
	{name: "Level 7", key: 7},
	{name: "Level 8", key: 8},
	{name: "Level 9", key: 9},
];

Template.spellLibraryDialog.onCreated(function(){
	this.selectedSpells = new ReactiveVar([]); //this holds an array of the selected spells by ID
	this.searchTerm = new ReactiveVar();
	this.categoriesOpen = new ReactiveVar([]);
	this.readyDict = new ReactiveDict();
	this.searchReady = new ReactiveVar();
	librarySubs.subscribe("standardLibraries");
	this.autorun(() => {
		// Subscribe to all open categories
		_.each(this.categoriesOpen.get(), (key) => {
			var handle = librarySubs.subscribe("standardLibrarySpells", key);
			this.autorun(() => {
				this.readyDict.set(key, handle.ready());
			});
		});
	});
	this.autorun(() => {
		// If we are searching, subscibe to all categories
		if (this.searchTerm.get()){
			let handles = _.map(categories, category =>
				librarySubs.subscribe("standardLibrarySpells", category.key)
			);
			// Ready when all handles are ready
			this.autorun(() => {
				this.searchReady.set(_.every(handles, h => h.ready()));
			});
		}
	});
});

Template.spellLibraryDialog.helpers({
	ready(key){
		return Template.instance().readyDict.get(key);
	},
	categories(){
		return categories;
	},
	spellsInCategory(categoryKey){
		return LibrarySpells.find({
			library: "SRDLibraryGA3XWsd",
			level: categoryKey,
		}, {
			sort: {name: 1},
		});
	},
	isSelected(spell){
		const selected = Template.instance().selectedSpells.get();
		return _.contains(selected, spell._id);
	},
	isOpen(key){
		const cats = Template.instance().categoriesOpen.get();
		return _.contains(cats, key);
	},
	searchTerm(){
		return Template.instance().searchTerm.get();
	},
	searchReady(){
		return Template.instance().searchReady.get();
	},
	searchSpells(){
		const searchTerm = Template.instance().searchTerm.get();
		if (!searchTerm) return;
		return LibrarySpells.find({
			library: "SRDLibraryGA3XWsd",
			name: {
				$regex: new RegExp(".*" + searchTerm + ".*", "gi")
			},
		});
	},
});

Template.spellLibraryDialog.events({
	"click .cancelButton": function(event, template){
		popDialogStack();
	},
	"click .okButton": function(event, template){
		const selectedIds = template.selectedSpells.get();
		var returnSpells = [];
		_.each(selectedIds, (id) => {
			let spell = LibrarySpells.findOne(id);
			if (spell) {
				returnSpells.push(spell)
			}
		});
		popDialogStack(returnSpells);
	},
	"click .library-spell": function(event, template){
		let selected = template.selectedSpells.get();
		const spellId = this.spell._id;
		// Toggle whether this spellId is in the array or not
		if (_.contains(selected, spellId)){
			selected = _.without(selected, spellId);
		} else {
			selected.push(spellId);
		}
		template.selectedSpells.set(selected);


		console.log("selectedSpells", Template.instance().selectedSpells.get());
		console.log("spellId", this.spell._id);
	},
	"click #backButton": function(event, template){
		popDialogStack();
	},
	"click .category-header": function(event, template){
		let cats = template.categoriesOpen.get();
		const key = this.key;
		// Toggle whether this key is in the array or not
		if (_.contains(cats, key)){
			cats = _.without(cats, key);
		} else {
			cats.push(key);
		}
		template.categoriesOpen.set(cats);
	},
	"input .search-input, change .search-input": function(event, template){
		const value = event.currentTarget.value;
		template.searchTerm.set(value);
	},
});
