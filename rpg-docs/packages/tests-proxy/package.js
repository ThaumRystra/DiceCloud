Package.describe({
	name: "velocity:test-proxy",
	summary: "Dynamically created package to expose test files to mirrors",
	version: "0.0.4",
	debugOnly: true
});

Package.onUse(function (api) {
	api.use("coffeescript", ["client", "server"]);
	api.add_files("tests/mocha/server/lib/characterUtility.js",["server"]);
	api.add_files("tests/mocha/server/model/character/character.js",["server"]);
	api.add_files("tests/mocha/server/model/character/effects.js",["server"]);
	api.add_files("tests/mocha/server/sampleServerTest.js",["server"]);
});