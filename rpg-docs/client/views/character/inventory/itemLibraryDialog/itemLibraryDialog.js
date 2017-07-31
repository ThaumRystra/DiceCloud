const librarySubs = new SubsManager();

const categories = [
	{name: "Weapons", key: "weapons"},
	{name: "Armor", key: "armor"},
	{name: "Adventuring Gear", key: "adventuringGear"},
	{name: "Tools", key: "tools"},
];

Template.itemLibraryDialog.onCreated(function(){
	this.selectedItem = new ReactiveVar();
	this.searchTerm = new ReactiveVar();
	this.categoriesOpen = new ReactiveVar([]);
	this.readyDict = new ReactiveDict();
	this.searchReady = new ReactiveVar();
	this.isEquipmentPackOpen = new ReactiveVar(false);
	librarySubs.subscribe("standardLibraries");
	this.autorun(() => {
		// Subscribe to all open categories
		_.each(this.categoriesOpen.get(), (key) => {
			var handle = librarySubs.subscribe("standardLibraryItems", key);
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
	selectedId() {
		const selected = Template.instance().selectedItem.get();
		return selected && selected._id;
	},
	isOpen(key){
		const cats = Template.instance().categoriesOpen.get();
		return _.contains(cats, key);
	},
	isEquipmentPackOpen(){
		return Template.instance().isEquipmentPackOpen.get();
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
		var selected = template.selectedItem.get();
		if (selected && selected.container) {
			//then it is an equipment pack

			let pack = selected;
			if (!pack) {popDialogStack();};

			var returnObject = {contents: []};
			if (pack.container && pack.container.inLibrary) {
				let rawContainer = LibraryItems.findOne({name: pack.container.name, library: "SRDLibraryGA3XWsd"});
				var container = Schemas.Container.clean(_.clone(rawContainer));
			} else {
				var container = Schemas.Container.clean({name: pack.container.name});
			}
			returnObject.container = container;

			_.each(pack.contents, (item)=>{
				if (item.inLibrary) {
					let libraryItem = LibraryItems.findOne({name: item.name, library: "SRDLibraryGA3XWsd"});
					if (!libraryItem) {
						console.log("Error: Item '" + item.name + "' not found in SRD.")
					}
					libraryItem = _.extend(libraryItem, {quantity: item.quantity});
					returnObject.contents.push( _.omit(libraryItem, "_id") );
				} else {
					let libraryItem = Schemas.LibraryItems.clean( {name: item.name, quantity: item.quantity} );
					returnObject.contents.push(libraryItem);
				}
			});

			popDialogStack({type: "equipmentPack", return: returnObject});
		} 
		else {
			popDialogStack({type: "item", return: template.selectedItem.get()});
		}
	},
	"click .library-item, click": function(event, template){
		template.selectedItem.set(this.item);
	},
	"click .library-equipment-pack, click": function(event, template){
		template.selectedItem.set(this.pack);
	},
	"click #backButton": function(event, template){
		popDialogStack();
	},
	"click .item-category-header": function(event, template){
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
	"click .equipment-pack-category-header": function(event, template){
		const isOpen = template.isEquipmentPackOpen.get()
		template.isEquipmentPackOpen.set(!isOpen)
	},
	"input .search-input, change .search-input": function(event, template){
		const value = event.currentTarget.value;
		template.searchTerm.set(value);
	},
});
