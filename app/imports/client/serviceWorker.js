Meteor.startup(() => {
  navigator.serviceWorker.register('/sw.js')
    .then()
    .catch(error => console.log('ServiceWorker registration failed: ', error));
});
