import { JsonRoutes, RestMiddleware } from 'meteor/simple:json-routes';
import { SimpleRest } from 'meteor/simple:rest';

Meteor.startup(() => {
  // Enable cross origin requests for all endpoints
  JsonRoutes.setResponseHeaders({
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
});

SimpleRest.configure({
  // No default collection methods get end points
  collections: [],
});

// All errors are handled as JSON
JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);

// Hack to stop simple:rest adding routes automatically unless their URL
// has been explicitly set to 'api/...'
const oldAdd = JsonRoutes.add;
JsonRoutes.add = function (method, path, handler) {
  if (path.substring(0, 4) !== 'api/') {
    return;
  }
  oldAdd(method, path, handler);
}

import '/imports/server/rest/restLogin';
