Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .catch(error => console.log('ServiceWorker registration failed: ', error));
  }
});
