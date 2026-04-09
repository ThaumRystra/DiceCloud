// A simple endpoint that does a single round trip to the database to check everything is working

import { JsonRoutes } from 'meteor/simple:json-routes';

const HealthCheckCollection = new Mongo.Collection('healthCheck');

// Don't use redis oplog optimization on this collection, we want to hit the database every time
HealthCheckCollection.disableRedis?.();

const healthCheckDoc = {
  status: 'ok',
};

// Add the health check doc on startup if it's missing
// There should only be this single doc in the collection
// A capped collection would be marginally faster, but it's a pain to make one in Meteor
Meteor.startup(async function () {
  if (!await HealthCheckCollection.findOneAsync()) {
    await HealthCheckCollection.insertAsync(healthCheckDoc);
  }
});

JsonRoutes.add('get', 'api/status', async function (req, res) {
  let dbHealthDoc;
  try {
    dbHealthDoc = await HealthCheckCollection.findOneAsync();
  } catch (e) {
    JsonRoutes.sendResult(res, { code: 503, data: {} });
    return;
  }
  if (dbHealthDoc?.status === 'ok') {
    JsonRoutes.sendResult(res, { code: 200, data: dbHealthDoc });
  } else {
    JsonRoutes.sendResult(res, { code: 500, data: dbHealthDoc || {} });
  }
});
