import { Migrations } from 'meteor/percolate:migrations';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION.js';

if (Meteor.isServer){
  Meteor.startup(()=>{
    const dbVersion = Migrations.getVersion();
    if (
      !Meteor.settings.public.maintenanceMode &&
      SCHEMA_VERSION !== dbVersion
    ){
      Meteor.settings.public.maintenanceMode =  {
        reason: 'App data needs to be migrated to the latest version'
      };
    }
  });
}

const MAINTENANCE_MODE = Meteor.settings.public.maintenanceMode;
export default MAINTENANCE_MODE;
