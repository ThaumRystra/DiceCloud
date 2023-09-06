// A simple endpoint that does a single round trip to the database to check everything is working

const HealthCheckCollection = new Mongo.Collection('healthCheck');

// Don't use redis oplog optimization on this collection, we want to hit the database every time
HealthCheckCollection.disableRedis?.();

const healthCheckDoc = {
  status: 'ok',
};

// Add the health check doc on startup if it's missing
// There should only be this single doc in the collection
// A capped collection would be marginally faster, but it's a pain to make one in Meteor
Meteor.startup(function () {
  if (!HealthCheckCollection.findOne()) {
    HealthCheckCollection.insert(healthCheckDoc);
  }
});

Meteor.method('api-status', function () {
  let dbHealthDoc;
  try {
    dbHealthDoc = HealthCheckCollection.findOne();
  } catch (e) {
    this.setHttpStatusCode(503);
  }
  if (dbHealthDoc?.status === 'ok') {
    this.setHttpStatusCode(200);
  } else {
    this.setHttpStatusCode(500);
  }
  return dbHealthDoc || {};
}, {
  httpMethod: 'GET',
  url: 'api/status'
});
