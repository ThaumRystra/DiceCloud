declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      roles?: string[];
    }
  }
}