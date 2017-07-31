const librarySubs = new SubsManager();

Template.equipmentPackLibraryDialog.onCreated(function(){
	this.selectedPack = new ReactiveVar();
	librarySubs.subscribe("standardLibraries");
	librarySubs.subscribe("standardLibraryEquipmentPacks");
	librarySubs.subscribe("standardLibraryItems", "adventuringGear");
	librarySubs.subscribe("standardLibraryItems", "tools");
});

Template.equipmentPackLibraryDialog.helpers({
	equipmentPacks(){
		return LibraryEquipmentPacks.find({
			library: "SRDLibraryGA3XWsd",
		}, {
			sort: {name: 1},
		});
	},
	isSelected(pack){
		const selected = Template.instance().selectedPack.get();
		return selected && selected._id === pack._id;
	},
});

Template.equipmentPackLibraryDialog.events({
	"click .cancelButton": function(event, template){
		popDialogStack();
	},
	"click .okButton": function(event, template){
		let pack = template.selectedPack.get();
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
		popDialogStack(returnObject);
	},
	"click .library-equipment-pack": function(event, template){
		template.selectedPack.set(this.pack);
	},
	"click #backButton": function(event, template){
		popDialogStack();
	},
});
