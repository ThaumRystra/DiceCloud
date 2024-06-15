import { DDPServer } from 'meteor/ddp-server';
const { NO_MERGE_MULTI } = DDPServer.publicationStrategies;

/*
  NO_MERGE_MULTI does not keep copies of documents in server memory, but does keep track of what ids
  have been sent to the client over multiple subscriptions. Lower memory use, but sends more updates
  to the clients, which will need to merge them.
*/
Meteor.server.setPublicationStrategy(
  'creatureProperties', NO_MERGE_MULTI
);
Meteor.server.setPublicationStrategy(
  'creatureVariables', NO_MERGE_MULTI
);
Meteor.server.setPublicationStrategy(
  'libraryNodes', NO_MERGE_MULTI
);
