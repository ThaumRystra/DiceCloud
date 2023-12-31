import emailTemplate from './emailTemplate';

Accounts.emailTemplates.from = 'no-reply@dicecloud.com';
Accounts.emailTemplates.siteName = 'DiceCloud';

Accounts.emailTemplates.enrollAccount = {
  subject: () => 'DiceCloud Invite',
  html: (user, url) => emailTemplate({
    heading: 'DiceCloud Invite',
    text: 'You have been invited to DiceCloud, click the button below to begin.',
    buttonText: 'Get Started',
    url: url.replace('#/', ''),
  }),
};

Accounts.emailTemplates.resetPassword = {
  subject: () => 'DiceCloud Password Reset',
  html: (user, url) => emailTemplate({
    heading: 'Password Reset',
    text: 'If you did not request this password reset, please ignore this email.',
    buttonText: 'Reset Password',
    url: url.replace('#/', ''),
  }),
};

Accounts.emailTemplates.verifyEmail = {
  subject: () => 'DiceCloud Email Verification',
  html: (user, url) => emailTemplate({
    heading: 'DiceCloud Email Verification',
    text: 'Click below to verify your email address',
    buttonText: 'Verify Email',
    url: url.replace('#/', ''),
  }),
};
