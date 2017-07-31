const librarySubs = new SubsManager();

Template.equipmentPackLibraryView.onCreated(function(){
	this.selectedPack = new ReactiveVar();
	this.ready = new ReactiveVar();

	this.handles = [
		librarySubs.subscribe("standardLibraries"),
		librarySubs.subscribe("standardLibraryEquipmentPacks"),
		librarySubs.subscribe("standardLibraryItems", "adventuringGear"),
		librarySubs.subscribe("standardLibraryItems", "tools"),
	];

	this.autorun(() => {
		this.ready.set(_.every(this.handles, h => h.ready()));
	});
});

Template.equipmentPackLibraryView.helpers({
	equipmentPacks(){
		return LibraryEquipmentPacks.find({
			library: "SRDLibraryGA3XWsd",
		}, {
			sort: {name: 1},
		});
	},
	isSelected(pack){
		return Template.instance().data.selected === pack._id;
	},
	ready() {
		return Template.instance().ready.get();
	},
});
