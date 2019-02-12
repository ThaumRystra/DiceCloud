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
        assertCanEdit(key, charId, "addSpellsToCharacter");
        let ids = [];
        let error;
        for (let spell of spells) {
            spell.charId = charId;
            try {
                Schemas.Spell.clean(spell);
            } catch (e) {
                // console.log(e);
                error = e.error;
            }
            if (!error) {
                spell.parent = {id: listId, collection: "SpellLists"};
                let id = Spells.direct.insert(spell, (err) => {
                    if (err) {
                        error = err.message;
                    }
                });
                // console.log(id);
                ids.push(id);
            } else {
                break;
            }
        }
        if (error) {
            throw new Meteor.Error(400, "Failed to insert one or more spells", JSON.stringify({
                err: error,
                inserted: ids
            }));
        } else {
            return ids;
        }
    },

    "insertCharacter": function (key, character) {
        if (Meteor.isClient) return;
        assertAuthorized(key, "createCharacter");
        let error, id;

        character.owner = userIdFromKey(key);
        try {
            Schemas.Character.clean(character);
        } catch (e) {
            console.log(e);
            error = e.error;
        }
        if (!error) {
            id = Characters.direct.insert(character, (err) => {
                if (err)
                    error = err.message;
            });
            afterCharacterInsert(id);
            return {id: id};
        } else {
            throw new Meteor.Error(400, "Failed to insert character", JSON.stringify({err: error}));
        }
    },

    "deleteCharacter": function (key, charId) {
        if (Meteor.isClient) return;
        assertAuthorized(key, "deleteCharacter");
        if (isOwner(charId, userIdFromKey(key))) {
            let error;

            Characters.direct.remove({_id: charId}, (err) => {
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
    },

    "transferCharacterOwnership": function (key, charId, newOwner) {
        if (Meteor.isClient) return;
        assertAuthorized(key, "transferCharacterOwnership");
        if (isOwner(charId, userIdFromKey(key))) {
            let error;
            Characters.direct.update({_id: charId}, {"$set": {owner: newOwner}}, null,
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
    },

    "insertFeatures": function (key, charId, features) {
        if (Meteor.isClient) return;
        assertCanEdit(key, charId, "insertFeatures");
        let ids = [];
        let error;
        for (let feature of features) {
            feature.charId = charId;
            try {
                Schemas.Feature.clean(feature);
            } catch (e) {
                error = e.error;
            }
            if (!error) {
                let id = Features.direct.insert(feature, (err) => {
                    if (err) {
                        error = err.message;
                    }
                });
                ids.push(id);
            } else {
                break;
            }
        }
        if (error) {
            throw new Meteor.Error(400, "Failed to insert one or more features", JSON.stringify({
                err: error,
                inserted: ids
            }));
        } else {
            return ids;
        }

    },

    "insertProfs": function (key, charId, profs) {
        if (Meteor.isClient) return;
        assertCanEdit(key, charId, "insertProfs");
        let ids = [];
        let error;
        for (let prof of profs) {
            prof.charId = charId;
            try {
                Schemas.Proficiency.clean(prof, {filter: false});
            } catch (e) {
                error = e.error;
            }
            if (!error) {
                let id = Proficiencies.direct.insert(prof, (err) => {
                    if (err) {
                        error = err.message;
                    }
                });
                ids.push(id);
            } else {
                break;
            }
        }
        if (error) {
            throw new Meteor.Error(400, "Failed to insert one or more profs", JSON.stringify({
                err: error,
                inserted: ids
            }));
        } else {
            return ids;
        }
    },

    "insertEffects": function (key, charId, effects) {
        if (Meteor.isClient) return;
        assertCanEdit(key, charId, "insertEffects");
        let ids = [];
        let error;
        for (let effect of effects) {
            effect.charId = charId;
            try {
                Schemas.Effect.clean(effect, {filter: false});
            } catch (e) {
                error = e.error;
            }
            if (!error) {
                let id = Effects.direct.insert(effect, (err) => {
                    if (err) {
                        error = err.message;
                    }
                });
                ids.push(id);
            } else {
                break;
            }
        }
        if (error) {
            throw new Meteor.Error(400, "Failed to insert one or more effects", JSON.stringify({
                err: error,
                inserted: ids
            }));
        } else {
            return ids;
        }
    },

    "insertClasses": function (key, charId, klasses) {
        if (Meteor.isClient) return;
        assertCanEdit(key, charId, "insertClasses");
        let ids = [];
        let error;
        for (let klass of klasses) {
            klass.charId = charId;
            try {
                Schemas.Class.clean(klass);
            } catch (e) {
                error = e.error;
            }
            if (!error) {
                let id = Classes.direct.insert(klass, (err) => {
                    if (err) {
                        error = err.message;
                    }
                });
                ids.push(id);
            } else {
                break;
            }
        }
        if (error) {
            throw new Meteor.Error(400, "Failed to insert one or more classes", JSON.stringify({
                err: error,
                inserted: ids
            }));
        } else {
            return ids;
        }
    }
});

var assertCanEdit = function (key, charId, method) {
    if (canEditCharacter(charId, userIdFromKey(key))) {
        assertAuthorized(key, method);
    } else {
        throw new Meteor.Error(403, "You do not have permission to edit the requested character");
    }
};

var assertAuthorized = function (apiKey, method) {
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
    }
};

var afterCharacterInsert = function (charId) {
    // Effects
    Effects.direct.insert({
        charId: charId,
        name: "Constitution modifier for each level",
        stat: "hitPoints",
        operation: "add",
        calculation: "level * constitutionMod",
        parent: {
            id: charId,
            collection: "Characters",
            group: "Inate",
        },
    });
    Effects.direct.insert({
        charId: charId,
        name: "Proficiency bonus by level",
        stat: "proficiencyBonus",
        operation: "add",
        calculation: "floor(level / 4 + 1.75)",
        parent: {
            id: charId,
            collection: "Characters",
            group: "Inate",
        },
    });
    Effects.direct.insert({
        charId: charId,
        name: "Dexterity Armor Bonus",
        stat: "armor",
        operation: "add",
        calculation: "dexterityArmor",
        parent: {
            id: charId,
            collection: "Characters",
            group: "Inate",
        },
    });
    Effects.direct.insert({
        charId: charId,
        name: "Natural Armor",
        stat: "armor",
        operation: "base",
        value: 10,
        parent: {
            id: charId,
            collection: "Characters",
            group: "Inate",
        },
    });
    Effects.direct.insert({
        charId: charId,
        name: "Natural Carrying Capacity",
        stat: "carryMultiplier",
        operation: "base",
        value: "1",
        parent: {
            id: charId,
            collection: "Characters",
            group: "Inate",
        },
    });
    // Features
    let featureId = Features.direct.insert({
        name: "Base Ability Scores",
        charId: charId,
        enabled: true,
        alwaysEnabled: true,
    });
    Effects.direct.insert({
        stat: "strength",
        charId: charId,
        parent: {
            id: featureId,
            collection: "Features",
        },
        operation: "base",
        value: 10,
        enabled: true,
    });
    Effects.direct.insert({
        stat: "dexterity",
        charId: charId,
        parent: {
            id: featureId,
            collection: "Features",
        },
        operation: "base",
        value: 10,
        enabled: true,
    });
    Effects.direct.insert({
        stat: "constitution",
        charId: charId,
        parent: {
            id: featureId,
            collection: "Features",
        },
        operation: "base",
        value: 10,
        enabled: true,
    });
    Effects.direct.insert({
        stat: "intelligence",
        charId: charId,
        parent: {
            id: featureId,
            collection: "Features",
        },
        operation: "base",
        value: 10,
        enabled: true,
    });
    Effects.direct.insert({
        stat: "wisdom",
        charId: charId,
        parent: {
            id: featureId,
            collection: "Features",
        },
        operation: "base",
        value: 10,
        enabled: true,
    });
    Effects.direct.insert({
        stat: "charisma",
        charId: charId,
        parent: {
            id: featureId,
            collection: "Features",
        },
        operation: "base",
        value: 10,
        enabled: true,
    });
    // Items
    let containerId = Containers.direct.insert({
        name: "Coin Pouch",
        charId: charId,
        isCarried: true,
        description: "A sturdy pouch for coins",
        color: "d",
    });
    Items.direct.insert({
        name: "Gold piece",
        plural: "Gold pieces",
        charId: charId,
        quantity: 0,
        weight: 0.02,
        value: 1,
        color: "n",
        parent: {
            id: containerId,
            collection: "Containers",
        },
        settings: {
            showIncrement: true,
        },
    });
    Items.direct.insert({
        name: "Silver piece",
        plural: "Silver pieces",
        charId: charId,
        quantity: 0,
        weight: 0.02,
        value: 0.1,
        color: "q",
        parent: {
            id: containerId,
            collection: "Containers",
        },
        settings: {
            showIncrement: true,
        },
    });
    Items.direct.insert({
        name: "Copper piece",
        plural: "Copper pieces",
        charId: charId,
        quantity: 0,
        weight: 0.02,
        value: 0.01,
        color: "s",
        parent: {
            id: containerId,
            collection: "Containers",
        },
        settings: {
            showIncrement: true,
        },
    });
};
