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
    }).post(
        function () {
            ifPostOK(this, "addSpellsToList", () => {
                const spells = this.request.body;
                const charId = this.params._id;
                const listId = this.params.listId;
                let spellIds = [];
                let error;
                for (let spell of spells) {
                    spell.parent = {id: listId, collection: "SpellLists"};
                    spell.charId = charId;
                    let id = Spells.insert(spell, (err, _id) => {
                        if (err) {
                            error = err.message;
                        }
                    });
                    if (error)
                        break;
                    spellIds.push(id);
                }
                if (error) {
                    this.response.writeHead(400, "Failed to insert one or more spells");
                    this.response.end(JSON.stringify({err: error, inserted: spellIds}));
                } else {
                    this.response.end(JSON.stringify(spellIds));
                }
            });
        }
    );

    this.route("createCharacter", { // POST /api/character
        path: "/api/character",
        where: "server"
    }).post(
        function () {
            this.response.setHeader("Content-Type", "application/json");
            const header = this.request.headers;
            const key = header && header['authorization'];
            ifKeyValid(key, this.response, "createCharacter", () => {
                const character = this.request.body;
                let error;

                character.owner = userIdFromKey(key);
                let id = Characters.insert(character, (err) => {
                    if (err)
                        error = err.message;
                });

                if (error) {
                    this.response.writeHead(400, "Failed to insert character");
                    this.response.end(JSON.stringify({err: error}));
                } else {
                    this.response.end(JSON.stringify({id: id}));
                }
            });
        }
    );

    this.route("transferCharacterOwnership", { // PUT /api/character/:_id/owner
        path: "/api/character/:_id/owner",
        where: "server"
    }).put(
        function () {
            this.response.setHeader("Content-Type", "application/json");
            const header = this.request.headers;
            const key = header && header['authorization'];
            const charId = this.params._id;
            ifKeyValid(key, this.response, "transferCharacterOwnership", () => {
                if (isOwner(charId, userIdFromKey(key))) {
                    const newOwner = this.request.body['id'];
                    let error;
                    Characters.update({_id: charId}, {"$set": {owner: newOwner}}, null,
                        (err) => {
                            if (err)
                                error = err.message;
                        });

                    if (error) {
                        this.response.writeHead(400, "Failed to update character");
                        this.response.end(JSON.stringify({err: error}));
                    } else {
                        this.response.end(JSON.stringify({success: true}));
                    }
                } else {
                    this.response.writeHead(403, "You do not have permission to transfer this character");
                    this.response.end();
                }
            });
        }
    );

    this.route("insertFeatures", { // POST /api/character/:_id/feature
        path: "/api/character/:_id/feature",
        where: "server",
    }).post(
        function () {
            ifPostOK(this, "insertFeatures", () => {
                const features = this.request.body;
                const charId = this.params._id;
                let ids = [];
                let error;
                for (let feature of features) {
                    feature.charId = charId;
                    let id = Features.insert(feature, (err) => {
                        if (err) {
                            error = err.message;
                        }
                    });
                    if (error)
                        break;
                    ids.push(id);
                }
                if (error) {
                    this.response.writeHead(400, "Failed to insert one or more features");
                    this.response.end(JSON.stringify({err: error, inserted: ids}));
                } else {
                    this.response.end(JSON.stringify(ids));
                }
            });
        }
    );

    this.route("insertProfs", { // POST /api/character/:_id/prof
        path: "/api/character/:_id/prof",
        where: "server",
    }).post(
        function () {
            ifPostOK(this, "insertProfs", () => {
                const profs = this.request.body;
                const charId = this.params._id;
                let ids = [];
                let error;
                for (let prof of profs) {
                    prof.charId = charId;  // we currently rely on the client to supply parent
                    let id = Proficiencies.insert(prof, (err) => {
                        if (err) {
                            error = err.message;
                        }
                    });
                    if (error)
                        break;
                    ids.push(id);
                }
                if (error) {
                    this.response.writeHead(400, "Failed to insert one or more profs");
                    this.response.end(JSON.stringify({err: error, inserted: ids}));
                } else {
                    this.response.end(JSON.stringify(ids));
                }
            });
        }
    );

    this.route("insertEffects", { // POST /api/character/:_id/effect
        path: "/api/character/:_id/effect",
        where: "server",
    }).post(
        function () {
            ifPostOK(this, "insertEffects", () => {
                const effects = this.request.body;
                const charId = this.params._id;
                let ids = [];
                let error;
                for (let effect of effects) {
                    effect.charId = charId;  // we currently rely on the client to supply parent
                    let id = Effects.insert(effect, (err) => {
                        if (err) {
                            error = err.message;
                        }
                    });
                    if (error)
                        break;
                    ids.push(id);
                }
                if (error) {
                    this.response.writeHead(400, "Failed to insert one or more effects");
                    this.response.end(JSON.stringify({err: error, inserted: ids}));
                } else {
                    this.response.end(JSON.stringify(ids));
                }
            });
        }
    );

    this.route("insertClasses", { // POST /api/character/:_id/class
        path: "/api/character/:_id/class",
        where: "server",
    }).post(
        function () {
            ifPostOK(this, "insertClasses", () => {
                const klasses = this.request.body;
                const charId = this.params._id;
                let ids = [];
                let error;
                for (let klass of klasses) {
                    klass.charId = charId;  // we currently rely on the client to supply parent
                    let id = Classes.insert(klass, (err) => {
                        if (err) {
                            error = err.message;
                        }
                    });
                    if (error)
                        break;
                    ids.push(id);
                }
                if (error) {
                    this.response.writeHead(400, "Failed to insert one or more classes");
                    this.response.end(JSON.stringify({err: error, inserted: ids}));
                } else {
                    this.response.end(JSON.stringify(ids));
                }
            });
        }
    );
});

var ifPostOK = function (router, endpoint, callback) {
    router.response.setHeader("Content-Type", "application/json");
    var header = router.request.headers;
    var key = header && header['authorization'];
    ifKeyValid(key, router.response, endpoint, () => {
            if (canEditCharacter(router.params._id, userIdFromKey(key))) {
                callback();
            } else {
                router.response.writeHead(403, "You do not have permission to edit this character");
                router.response.end();
            }
        }
    );
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

var isKeyValid = function (apiKey) {
    var user = Meteor.users.findOne({apiKey});
    if (!user) return false;
    var blackListed = Blacklist.findOne({userId: user._id});
    return !blackListed;
};

var userIdFromKey = function (apiKey) {
    var user = Meteor.users.findOne({apiKey}); // we know user exists from isKeyValid
    return user._id;
};

var rateLimiter = new RateLimiter();
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

var isRateLimited = function (apiKey, method) {
    const limited = !rateLimiter.check({apiKey: apiKey, method: method}).allowed;
    if (limited) {
        console.log(`Rate limit hit by API key ${apiKey}`);
        return true;
    } else {
        return false;
    }
};
