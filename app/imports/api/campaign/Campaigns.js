import SimpleSchema from 'simpl-schema';

let Campaigns = new Mongo.Collection('campaigns');

let CampaignSchema = new SimpleSchema({

});

Campaigns.attachSchema(CampaignSchema);

export default Campaigns;
