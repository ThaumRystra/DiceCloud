Router.map(function () {
    this.route("vmixCharacter", {
        path: "/vmix-character/:_id/",
        where: "server",
        action: function () {
            this.response.setHeader("Content-Type", "application/json");
            var query = this.params.query;
            var key = query && query.key;
            ifKeyValid(key, this.response, "vmixCharacter", () =>
                this.response.end(vMixCharacter(this.params._id))
            );
        },
    });
    this.route("vmixParty", {
        path: "/vmix-party/:_id/",
        where: "server",
        action: function () {
            this.response.setHeader("Content-Type", "application/json");
            var query = this.params.query;
            var key = query && query.key;
            ifKeyValid(key, this.response, "vmixParty", () =>
                this.response.end(vMixParty(this.params._id))
            );
        },
    });

    this.route("jsonCharacterSheet", { // GET /character/:_id/json?key=:key
        path: "/character/:_id/json",
        where: "server",
        action: function () {
            this.response.setHeader("Content-Type", "application/json");
            var query = this.params.query;
            var key = query && query.key;
            ifKeyValid(key, this.response, "jsonCharacterSheet", () => {
                    if (canViewCharacter(this.params._id, userIdFromKey(key))) {
                        this.response.end(JSONExport(this.params._id))
                    } else {
                        this.response.writeHead(403, "You do not have permission to view this character");
                        this.response.end();
                    }
                }
            );
        },
    });

    this.route("getUserId", { // GET /api/user?username=:un&key=:key
        path: "/api/user",
        where: "server",
        action: function () {
            this.response.setHeader("Content-Type", "application/json");
            var query = this.params.query;
            var key = query && query.key;
            var username = query && query.username;
            ifKeyValid(key, this.response, "getUserId", () => {
                Meteor.call("getUserId", username, (err, result) => {
                    if (err) {
                        console.error(err);
                        this.response.writeHead(404, "User not found");
                        this.response.end();
                    } else {
                        console.log(result);
                        this.response.end(JSON.stringify({id: result}));
                    }
                });
            });
        }
    });

    this.route("addSpellsToCharacter", { // POST /api/character/:_id/spellList/:listId
        path: "/api/character/:_id/spellList/:listId",
        where: "server"
    }).post(function () {
        const key = startPOSTResponse(this);
        const spells = this.request.body;
        const charId = this.params._id;
        const listId = this.params.listId;
        Meteor.call("insertSpells", key, charId, listId, spells, (err, res) => {
            if (err) {
                console.log(err);
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("createCharacter", { // POST /api/character
        path: "/api/character",
        where: "server"
    }).post(function () {
        const key = startPOSTResponse(this);
        const character = this.request.body;
        Meteor.call("insertCharacter", key, character, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("deleteCharacter", { // DELETE /api/character/:_id
        path: "/api/character/:_id",
        where: "server"
    }).delete(function () {
        const key = startPOSTResponse(this);
        const charId = this.params._id;
        Meteor.call("deleteCharacter", key, charId, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("transferCharacterOwnership", { // PUT /api/character/:_id/owner
        path: "/api/character/:_id/owner",
        where: "server"
    }).put(function () {
        const key = startPOSTResponse(this);
        const charId = this.params._id;
        const ownerId = this.request.body['id'];
        Meteor.call("transferCharacterOwnership", key, charId, ownerId, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("insertFeatures", { // POST /api/character/:_id/feature
        path: "/api/character/:_id/feature",
        where: "server",
    }).post(function () {
        const key = startPOSTResponse(this);
        const charId = this.params._id;
        const features = this.request.body;
        Meteor.call("insertFeatures", key, charId, features, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("insertProfs", { // POST /api/character/:_id/prof
        path: "/api/character/:_id/prof",
        where: "server",
    }).post(function () {
        const key = startPOSTResponse(this);
        const charId = this.params._id;
        const profs = this.request.body;
        Meteor.call("insertProfs", key, charId, profs, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("insertEffects", { // POST /api/character/:_id/effect
        path: "/api/character/:_id/effect",
        where: "server",
    }).post(function () {
        const key = startPOSTResponse(this);
        const charId = this.params._id;
        const effects = this.request.body;
        Meteor.call("insertEffects", key, charId, effects, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });

    this.route("insertClasses", { // POST /api/character/:_id/class
        path: "/api/character/:_id/class",
        where: "server",
    }).post(function () {
        const key = startPOSTResponse(this);
        const charId = this.params._id;
        const classes = this.request.body;
        Meteor.call("insertClasses", key, charId, classes, (err, res) => {
            if (err) {
                this.response.writeHead(err.error, err.reason);
                this.response.end(err.details);
            } else {
                this.response.end(JSON.stringify(res));
            }
        });
    });
});

const startPOSTResponse = function (request) {
    request.response.setHeader("Content-Type", "application/json");
    const header = request.request.headers;
    return header && header['authorization'];
};

var ifKeyValid = function (apiKey, response, method, callback) {
    if (!apiKey) {
        response.writeHead(403, "You must use an api key to access this api");
        response.end();
    } else if (!isKeyValid(apiKey)) {
        response.writeHead(403, "API key is invalid");
        response.end();
    } else if (isRateLimited(apiKey, method)) {
        response.writeHead(429, "Too many requests");
        response.end(JSON.stringify({
            "timeToReset": rateLimiter.check({apiKey: apiKey, method: method}).timeToReset
        }));
    } else {
        rateLimiter.increment({apiKey: apiKey, method: method});
        callback();
    }
};

isKeyValid = function (apiKey) {
    var user = Meteor.users.findOne({apiKey});
    if (!user) return false;
    var blackListed = Blacklist.findOne({userId: user._id});
    return !blackListed;
};

userIdFromKey = function (apiKey) {
    var user = Meteor.users.findOne({apiKey}); // we know user exists from isKeyValid
    return user._id;
};

rateLimiter = new RateLimiter();
// global limit
rateLimiter.addRule({apiKey: String}, 10, 1000);

// vmix stuff
rateLimiter.addRule({apiKey: String, method: "vmixCharacter"}, 2, 10000);
rateLimiter.addRule({apiKey: String, method: "vmixParty"}, 2, 10000);

// bot API endpoints
rateLimiter.addRule({apiKey: String, method: "jsonCharacterSheet"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "getUserId"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "addSpellsToCharacter"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "createCharacter"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "transferCharacterOwnership"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "insertFeatures"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "insertProfs"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "insertEffects"}, 5, 5000);
rateLimiter.addRule({apiKey: String, method: "insertClasses"}, 5, 5000);

isRateLimited = function (apiKey, method) {
    const limited = !rateLimiter.check({apiKey: apiKey, method: method}).allowed;
    if (limited) {
        console.log(`Rate limit hit by API key ${apiKey}`);
        return true;
    } else {
        return false;
    }
};
