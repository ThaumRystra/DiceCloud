import { DDPServer } from 'meteor/ddp-server';

const setPublicationStrategy = Meteor.server.setPublicationStrategy;
const { NO_MERGE_MULTI } = DDPServer.publicationStrategies;

/*
  NO_MERGE_MULTI does not keep copies of documents in server memory, but does keep track of what ids
  have been sent to the client over multiple subscriptions. Lower memory use, but sends more updates
  to the clients, which will need to merge them.
*/

setPublicationStrategy('creatureProperties', NO_MERGE_MULTI);
setPublicationStrategy('creatureVariables', NO_MERGE_MULTI);
setPublicationStrategy('libraryNodes', NO_MERGE_MULTI);
