const librarySubs = new SubsManager();

Template.itemLibraryDialog.onCreated(function(){
	this.selectedItem = new ReactiveVar();
	this.searchTerm = new ReactiveVar();
	this.ready = new ReactiveVar();
	this.autorun(() => {
		var handle = librarySubs.subscribe("standardLibraries");
		this.ready.set(handle.ready());
	});
});

Template.itemLibraryDialog.helpers({
	ready(){
		return Template.instance().ready.get();
	},
	categories(){
		return [
			{name: "Weapons", key: "weapons"},
			{name: "Armor", key: "armor"},
			{name: "Adventuring Gear", key: "adventuringGear"},
		];
	},
	itemsInCategory(categoryKey){
		return LibraryItems.find({
			library: "SRDLibraryGA3XWsd",
			"settings.category": categoryKey,
		});
	},
	isSelected(item){
		const selected = Template.instance().selectedItem.get();
		return selected && selected._id === item._id;
	},
	searchTerm(){
		return Template.instance().searchTerm.get();
	},
	searchItems(){
		const searchTerm = Template.instance().searchTerm.get();
		return LibraryItems.find({
			library: "SRDLibraryGA3XWsd",
			name: {
				$regex: new RegExp(".*" + searchTerm + ".*", "gi")
			},
		});
	},
});

Template.itemLibraryDialog.events({
	"click .cancelButton": function(event, template){
		popDialogStack();
	},
	"click .okButton": function(event, template){
		popDialogStack(template.selectedItem.get());
	},
	"click .library-item": function(event, template){
		template.selectedItem.set(this.item);
	},
	"click #backButton": function(event, template){
		popDialogStack();
	},
	"input .search-input, change .search-input": function(event, template){
		const value = event.currentTarget.value;
		template.searchTerm.set(value);
	},
});
