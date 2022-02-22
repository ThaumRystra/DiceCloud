const MAX_LOGIN_TOKENS = 20;

Accounts._insertHashedLoginToken = function(userId, hashedToken, query) {
  query = query ? { ...query } : {};
  query._id = userId;
  const user = Accounts.users.findOne(query);
  let loginTokenLength = user?.services?.resume?.loginTokens?.length;
  while (loginTokenLength >= MAX_LOGIN_TOKENS){
    loginTokenLength -=1;
    Accounts.users.update(query, {
      $pop: {
        'services.resume.loginTokens': -1
      }
    });
  }
  Accounts.users.update(query, {
    $addToSet: {
      'services.resume.loginTokens': hashedToken
    }
  });
};
