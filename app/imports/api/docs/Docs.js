if (Meteor.isServer) throw 'Client side only collection, don\'t import on server';
const Docs = new Mongo.Collection('docs');
export default Docs;
