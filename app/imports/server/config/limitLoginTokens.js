const MAX_LOGIN_TOKENS = 20;

Accounts._insertHashedLoginToken = async function (userId, hashedToken, query) {
  query = query ? { ...query } : {};
  query._id = userId;
  const user = await Accounts.users.findOneAsync(query);
  let loginTokenLength = user?.services?.resume?.loginTokens?.length;
  while (loginTokenLength >= MAX_LOGIN_TOKENS) {
    loginTokenLength -= 1;
    await Accounts.users.updateAsync(query, {
      $pop: {
        'services.resume.loginTokens': -1
      }
    });
  }
  await Accounts.users.updateAsync(query, {
    $addToSet: {
      'services.resume.loginTokens': hashedToken
    }
  });
};
