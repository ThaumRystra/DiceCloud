import { Migrations } from 'meteor/percolate:migrations';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';

if (Meteor.isServer) {
  Meteor.startup(() => {
    const dbVersion = Migrations.getVersion();
    // If there are no users, this is a new DB, set the version to latest
    const aUser = Meteor.users.findOne({});
    const latestVersion = Migrations._list[Migrations._list.length - 1].version
    if (!aUser && dbVersion !== latestVersion) {
      Migrations._collection.update({ _id: 'control' }, { version: latestVersion });
      return;
    }
    // Otherwise put the app in maintenance mode if it's not the right version
    if (
      !Meteor.settings.public.maintenanceMode &&
      dbVersion !== undefined &&
      SCHEMA_VERSION !== dbVersion
    ) {
      Meteor.settings.public.maintenanceMode = {
        reason: 'App data needs to be migrated to the latest version'
      };
    }
  });
}

const MAINTENANCE_MODE = Meteor.settings.public.maintenanceMode;
export default MAINTENANCE_MODE;
