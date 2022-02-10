var Fiber = Npm.require('fibers');
import { RestMiddleware  } from 'meteor/simple:json-routes';

/**
 * SimpleRest middleware for validating a Meteor.user's login token
 *
 * This middleware must be processed after the request.token has been set to a
 * valid login token for a Meteor.user account (from a separate layer of
 * middleware). If authentication is successful, the request.userId will be set
 * to the ID of the authenticated user. An invalid token will result in a error.
 *
 * @middleware
 */
const authenticateMeteorUserByToken =
  function (req, res, next) {
    Fiber(function () {
      let userId;
      try {
        userId = getUserIdFromAuthToken(req.authToken);
      } catch (e){
        RestMiddleware.handleErrorAsJson(e, req, res, next);
        return;
      }
      if (userId) {
        req.userId = userId;
      }

      next();
    }).run();
  };

/**
 * Retrieves the ID of the Meteor.user that the given auth token belongs to
 *
 * @param token An unhashed auth token
 * @returns {String} The ID of the authenticated Meteor.user, or null if token
 *     is invalid
 */
function getUserIdFromAuthToken(token) {
  if (!token) {
    return null;
  }

  var user = Meteor.users.findOne({
    'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token),
  });
  if (user) {
    return user._id;
  } else {
    const error = new Meteor.Error('Permission denied',
    'Invalid authentication token');
    error.statusCode = 403;
    throw error;
  }
}

export default authenticateMeteorUserByToken;
