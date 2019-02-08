/**
 * @return {string}
 */
JSONExport = function (charId) {
    const character = {
        "attacks": Attacks.find({charId: charId}).fetch(),
        "characters": Characters.find({_id: charId}).fetch(),
        "classes": Classes.find({charId: charId}).fetch(),
        "containers": Containers.find({charId: charId}).fetch(),
        "effects": Effects.find({charId: charId}).fetch(),
        "experience": Experiences.find({charId: charId}).fetch(),
        "features": Features.find({charId: charId}).fetch(),
        "items": Items.find({charId: charId}).fetch(),
        "notes": Notes.find({charId: charId}).fetch(),
        "proficiencies": Proficiencies.find({charId: charId}).fetch(),
        "spellLists": SpellLists.find({charId: charId}).fetch(),
        "spells": Spells.find({charId: charId}).fetch()
    };
    return JSON.stringify(character);
};

Meteor.methods({
    "insertSpells": function (key, charId, listId, spells) {
        if (Meteor.isClient) return;
        ifCanEdit(key, charId, "addSpellsToCharacter", () => {
            let ids = [];
            let error;
            for (let spell of spells) {
                spell.parent = {id: listId, collection: "SpellLists"};
                spell.charId = charId;
                let id = Spells.insert(spell, (err) => {
                    if (err) {
                        error = err.message;
                    }
                });
                ids.push(id);
            }
            if (error) {
                throw new Meteor.Error(400, "Failed to insert one or more spells", JSON.stringify({
                    err: error,
                    inserted: ids
                }));
            } else {
                return ids;
            }
        });
    },

    "insertCharacter": function (key, character) {
        if (Meteor.isClient) return;
        ifAuthorized(key, "createCharacter", () => {
            let error;

            character.owner = userIdFromKey(key);
            let id = Characters.insert(character, (err) => {
                if (err)
                    error = err.message;
            });

            if (error) {
                throw new Meteor.Error(400, "Failed to insert character", JSON.stringify({err: error}));
            } else {
                return {id: id};
            }
        });
    },

    "deleteCharacter": function (key, charId) {
        if (Meteor.isClient) return;
        ifAuthorized(key, "deleteCharacter", () => {
            if (isOwner(charId, userIdFromKey(key))) {
                let error;

                Characters.remove({_id: charId}, (err) => {
                    if (err)
                        error = err.message;
                });
                if (error) {
                    throw new Meteor.Error(400, "Failed to delete character", JSON.stringify({err: error}));
                } else {
                    return {success: true};
                }
            } else {
                throw new Meteor.Error(403, "You do not have permission to delete the requested character");
            }
        });
    },

    "transferCharacterOwnership": function (key, charId, newOwner) {
        if (Meteor.isClient) return;
        ifAuthorized(key, "transferCharacterOwnership", () => {
            if (isOwner(charId, userIdFromKey(key))) {
                let error;
                Characters.update({_id: charId}, {"$set": {owner: newOwner}}, null,
                    (err) => {
                        if (err)
                            error = err.message;
                    });

                if (error) {
                    throw new Meteor.Error(400, "Failed to update character", JSON.stringify({err: error}));
                } else {
                    return {success: true};
                }
            } else {
                throw new Meteor.Error(403, "You do not have permission to transfer the requested character");
            }
        });
    },

    "insertFeatures": function (key, charId, features) {
        if (Meteor.isClient) return;
        ifCanEdit(key, charId, "insertFeatures", () => {
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
                throw new Meteor.Error(400, "Failed to insert one or more features", JSON.stringify({
                    err: error,
                    inserted: ids
                }));
            } else {
                return ids;
            }
        });
    },

    "insertProfs": function (key, charId, profs) {
        if (Meteor.isClient) return;
        ifCanEdit(key, charId, "insertProfs", () => {
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
                throw new Meteor.Error(400, "Failed to insert one or more profs", JSON.stringify({
                    err: error,
                    inserted: ids
                }));
            } else {
                return ids;
            }
        });
    },

    "insertEffects": function (key, charId, effects) {
        if (Meteor.isClient) return;
        ifCanEdit(key, charId, "insertEffects", () => {
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
                throw new Meteor.Error(400, "Failed to insert one or more effects", JSON.stringify({
                    err: error,
                    inserted: ids
                }));
            } else {
                return ids;
            }
        });
    },

    "insertClasses": function (key, charId, klasses) {
        if (Meteor.isClient) return;
        ifCanEdit(key, charId, "insertClasses", () => {
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
                throw new Meteor.Error(400, "Failed to insert one or more classes", JSON.stringify({
                    err: error,
                    inserted: ids
                }));
            } else {
                return ids;
            }
        });
    }
});

var ifCanEdit = function (key, charId, method, callback) {
    if (canEditCharacter(charId, userIdFromKey(key))) {
        ifAuthorized(key, method, callback);
    } else {
        throw new Meteor.Error(403, "You do not have permission to edit the requested character");
    }
};

var ifAuthorized = function (apiKey, method, callback) {
    if (!apiKey) {
        throw new Meteor.Error(403, "You must use an api key to access this api");
    } else if (!isKeyValid(apiKey)) {
        throw new Meteor.Error(403, "API key is invalid");
    } else if (isRateLimited(apiKey, method)) {
        throw new Meteor.Error(429, "Too many requests", JSON.stringify({
            "timeToReset": rateLimiter.check({apiKey: apiKey, method: method}).timeToReset
        }));
    } else {
        rateLimiter.increment({apiKey: apiKey, method: method});
        callback();
    }
};
