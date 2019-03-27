The grammer.js file is built separately from the rest of the build process
to rebuild the grammar after changing grammar.ne:

make sure Nearley in installed

`npm install -g nearley`

compile

`nearleyc grammar.ne -o grammar.js`

To make this happen as part of the build process, a Meteor build plugin needs to
created that can compile `.ne` files to `.js` and include them where ever
they need to be imported.
