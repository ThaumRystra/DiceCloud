const MAINTENANCE_MODE = Meteor.settings?.public?.maintenanceMode || false;

export default MAINTENANCE_MODE;
