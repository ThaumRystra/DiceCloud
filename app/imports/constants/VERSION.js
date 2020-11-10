
const VERSION = Meteor.isClient ?
  'CLIENT' :
  process.env.CONTAINER_VERSION || getVersionFromGit();

export default VERSION;

function getVersionFromGit(){
  try {
    return require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString().trim();
  } catch (e){
    return 'GIT_VERSION_FAIL'
  }
}
