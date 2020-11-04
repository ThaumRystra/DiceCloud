
const VERSION = Meteor.isClient ? 'CLIENT' : process.env.SOURCE_VERSION || require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString().trim();

export default VERSION;
