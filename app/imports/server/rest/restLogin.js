import { JsonRoutes } from 'meteor/simple:json-routes';
import authenticateMeteorUserByToken from './middleware/authenticateUserByToken';
/**
 * Login with username/email and password:
 *   POST /api/login
 *   Body: {"username": "<your username>", "password": "<your password>"}
 *   Alternative Body: {"email": "<your email>", "password": "<your password>"}
 * Successful response:
 *   {
 *     "id": "<your userId>",
 *     "token": "<your user token, save this>",
 *     "tokenExpires": "<date string of token expiry date>"
 *   }
 *
 * Warning: Your token may expire before the given date.
 * Since each user has a limited pool of login tokens. If you get a permission
 * error, you may need to login again to refresh your token
 *
 * Once you have your token, you can use it as a standard bearer token header
 * in other API endpoints:
 *  HTTP.post("/methods/return-five-auth", {
 *    headers: { Authorization: "Bearer <token>" }
 *  }, callback);
**/

JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseBearerToken);
JsonRoutes.Middleware.use(authenticateMeteorUserByToken);

JsonRoutes.add('options', 'api/login', function (req, res) {
  JsonRoutes.sendResult(res);
});

JsonRoutes.add('post', 'api/login', function (req, res) {
  var options = req.body;

  var user;
  if (options.email) {
    check(options, {
      email: String,
      password: String,
    });
    user = Accounts.findUserByEmail(options.email);
  } else {
    check(options, {
      username: String,
      password: String,
    });
    user = Accounts.findUserByUsername(options.username);
  }

  if (!user) {
    throw new Meteor.Error('not-found',
      'User with that username or email address not found.');
  }

  var result = Accounts._checkPassword(user, options.password);
  check(result, {
    userId: String,
    error: Match.Optional(Meteor.Error),
  });

  if (result.error) {
    throw result.error;
  }

  var stampedLoginToken = Accounts._generateStampedLoginToken();
  check(stampedLoginToken, {
    token: String,
    when: Date,
  });

  Accounts._insertLoginToken(result.userId, stampedLoginToken);

  var tokenExpiration = Accounts._tokenExpiration(stampedLoginToken.when);
  check(tokenExpiration, Date);

  JsonRoutes.sendResult(res, {
    data: {
      id: result.userId,
      token: stampedLoginToken.token,
      tokenExpires: tokenExpiration,
    },
  });

});
