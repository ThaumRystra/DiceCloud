Template.itemLibraryDialog.onCreated(function(){
	this.selectedItem = new ReactiveVar();
	this.searchTerm = new ReactiveVar();
});

Template.itemLibraryDialog.helpers({
	categories(){
		return [
			{name: "Weapons", key: "weapons"},
			{name: "Armor", key: "armor"},
			{name: "Adventuring Equipment", key: "adventuringEquipment"},
			{name: "Tools", key: "tools"},
		];
	},
	itemsInCategory(category){
		//TODO return a cursor of all library items in the category
		// As a dummy function returns a random 2 items
		let count = Items.find({}).count();
		return Items.find({}, {
			limit: 5,
			skip: Math.floor(Math.random() * (count - 5)),
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
		//TODO return something relevant to the search terms
		return Items.find({name: {
			$regex: new RegExp(".*" + searchTerm + ".*", "gi")
		}});
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
