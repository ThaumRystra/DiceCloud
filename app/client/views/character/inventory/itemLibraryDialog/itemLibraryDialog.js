const librarySubs = new SubsManager();

const categories = [
	{name: "Weapons", key: "weapons"},
	{name: "Armor", key: "armor"},
	{name: "Adventuring Gear", key: "adventuringGear"},
	{name: "Tools", key: "tools"},
];

const categoryKeys = [
	"weapons",
	"armor",
	"adventuringGear",
	"tools",
];

Template.itemLibraryDialog.onCreated(function(){
	this.selectedItem = new ReactiveVar();
	this.searchTerm = new ReactiveVar();
	this.categoriesOpen = new ReactiveVar([]);
	this.readyDict = new ReactiveDict();
	this.searchReady = new ReactiveVar();
	librarySubs.subscribe("standardLibraries");
	librarySubs.subscribe("customLibraries");

	this.autorun(() => {
		// Subscribe to all open categories
		_.each(this.categoriesOpen.get(), (key) => {
			let handle;
			if (_.contains(categoryKeys, key)){
				handle = librarySubs.subscribe("standardLibraryItems", key);
			} else {
				handle = librarySubs.subscribe("fullLibraryItems", key);
			}
			this.autorun(() => {
				this.readyDict.set(key, handle.ready());
			});
		});
	});
	this.autorun(() => {
		// If we are searching, subscibe to all categories
		if (this.searchTerm.get()){
			let handles = _.map(categories, category =>
				librarySubs.subscribe("standardLibraryItems", category.key)
			);
			// Ready when all handles are ready
			this.autorun(() => {
				this.searchReady.set(_.every(handles, h => h.ready()));
			});
		}
	});
});

Template.itemLibraryDialog.helpers({
	ready(key){
		return Template.instance().readyDict.get(key);
	},
	categories(){
		return categories;
	},
	itemsInCategory(categoryKey){
		return LibraryItems.find({
			library: "SRDLibraryGA3XWsd",
			"settings.category": categoryKey,
		}, {
			sort: {name: 1},
		});
	},
	isSelected(item){
		const selected = Template.instance().selectedItem.get();
		return selected && selected._id === item._id;
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
	searchItems(){
		const searchTerm = Template.instance().searchTerm.get();
		if (!searchTerm) return;
		return LibraryItems.find({
			name: {
				$regex: new RegExp(".*" + searchTerm + ".*", "gi")
			},
		});
	},
	customLibraries(){
		let userId = Meteor.userId();
		let user = Meteor.user()
		let subs = user && user.profile && user.profile.librarySubscriptions;
    return Libraries.find({
      $or: [
  			{readers: userId},
  			{writers: userId},
  			{owner: userId},
				{public: true, _id: {$in: subs || []}},
  		],
    });
	},
	itemsInLibrary(libraryId){
		return LibraryItems.find({
			library: libraryId,
		}, {
			sort: {name: 1},
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
	"click .category-header": function(event, template){
		let cats = template.categoriesOpen.get();
		const key = this.key || this._id;
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

Template.libraryItem.helpers({
	itemName: function(){
		return this.item.libraryName || this.item.name;
	},
	itemWeight: function(){
		if (this.item.quantity) {
			return this.item.weight * this.item.quantity;
		} else {
			return this.item.weight;
		}
	},
	itemValue: function(){
		if (this.item.quantity) {
			return this.item.value * this.item.quantity;
		} else {
			return this.item.value;
		}
	},

});
