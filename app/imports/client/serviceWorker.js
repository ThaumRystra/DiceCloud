Meteor.startup(() => {
  navigator.serviceWorker.register('/sw')
    .then()
    .catch(error => console.log('ServiceWorker registration failed: ', error));
});
