var getEffect = function(charId, op, value){
	return getAttributeEffect(charId, "constitution", op, value);
};

var getAttributeEffect = function(charId, attribute, op, value){
	return {
		charId: charId,
		type: "inate",
		stat: attribute,
		operation: op,
		value: value,
		parent: {
			id: charId,
			collection: "Characters"
		}
	}
}

var getSkillEffect = function(charId, op, value){
	return {
		charId: charId,
		type: "inate",
		stat: "athletics",
		operation: op,
		value: value,
		parent: {
			id: charId,
			collection: "Characters"
		}
	}
};

if (!(typeof MochaWeb === 'undefined')){
	MochaWeb.testOnly(function(){
		describe("Character", function(){
			var charId, char, con, ath, strMod;

			beforeEach(function(){
				Effects.remove({});
				Characters.remove({});
				charId = Characters.insert({owner: "FWeGYyDY5jc4HuTh8"});
				char  = Characters.findOne(charId);
				con = function(){return char.attributeValue("constitution")};
				ath = function(){return char.skillMod("athletics")};
				strMod = function(){return char.abilityMod("strength")};
			});

			describe("effects", function(){
				describe("attributeValue", function(){
					beforeEach(function(){
						Effects.remove({});
					});

					it("should be set to highest base", function(){
						Effects.insert(getEffect(charId, "base", 10));
						Effects.insert(getEffect(charId, "base", 6));
						chai.assert.equal(10, con());
					});

					it("should add", function(){
						Effects.insert(getEffect(charId, "add", 2));
						Effects.insert(getEffect(charId, "base", 10));
						chai.assert.equal(12, con());
					});

					it("should multiply after adding", function(){
						Effects.insert(getEffect(charId, "mul", 2));
						Effects.insert(getEffect(charId, "base", 10));
						Effects.insert(getEffect(charId, "add", 2));
						chai.assert.equal(24, con());
					});

					it("should be at least highest min", function(){
						Effects.insert(getEffect(charId, "min", 22));
						Effects.insert(getEffect(charId, "base", 10));
						Effects.insert(getEffect(charId, "add", 2));
						Effects.insert(getEffect(charId, "mul", 2));
						chai.assert.equal(con(), 24);
						Effects.insert(getEffect(charId, "min", 28));
						chai.assert.equal(28, con());
					});

					it("should be at most lowest max after minning", function(){
						Effects.insert(getEffect(charId, "max", 5));
						Effects.insert(getEffect(charId, "min", 22));
						Effects.insert(getEffect(charId, "base", 10));
						Effects.insert(getEffect(charId, "add", 2));
						Effects.insert(getEffect(charId, "mul", 2));
						chai.assert.equal(5, con());
						Effects.insert(getEffect(charId, "max", 6));
						chai.assert.equal(5, con());
					});

					it("should respect adjustment", function(){
						Effects.insert(getEffect(charId, "base", 10));
						Effects.insert(getEffect(charId, "add", 2));
						Effects.insert(getEffect(charId, "mul", 2));
						Effects.insert(getEffect(charId, "min", 28));
						Effects.insert(getEffect(charId, "max", 5));
						Characters.update(charId, {$set: {"constitution.adjustment": -2}})
						chai.assert.equal(3, con());
						var conBase = char.attributeBase("constitution");
						chai.assert.equal(5, conBase)
					});

					it("should be removed when the character is deleted", function(){
						Effects.insert(getEffect(charId, "base", 10));
						var count = Effects.find({charId: charId}).count();
						chai.assert.equal(count, 1);
						Characters.remove(charId);
						var count = Effects.find({charId: charId}).count();
						chai.assert.equal(count, 0);
					});

				});

				describe("skillMod", function(){
					beforeEach(function(){
						Effects.remove({});
					});
					
					it("should get its base value from the ability mod", function(){
						Effects.insert(getAttributeEffect(charId, "strength", "base", 16));
						chai.assert.equal(3, strMod());
						chai.assert.equal(3, ath());
					});
					
					it("should add a multiple of proficiency bonus", function(){
						Effects.insert(getAttributeEffect(charId, "strength", "base", 16));
						Effects.insert(getAttributeEffect(charId, "proficiencyBonus", "base", 7));
						chai.assert.equal(7, char.attributeValue("proficiencyBonus"), "the proficiency bonus is calculated correctly");
						Effects.insert(getSkillEffect(charId, "proficiency", 0.5));
						Effects.insert(getSkillEffect(charId, "proficiency", 2));
						chai.assert.equal(17, ath(), "3 strength + (7 x 2) proficiency bonus");
					});

					it("should add", function(){
						Effects.insert(getAttributeEffect(charId, "strength", "base", 16));
						Effects.insert(getSkillEffect(charId, "add", 2));
						chai.assert.equal(5, ath());
					});

					it("should multiply", function(){
						Effects.insert(getAttributeEffect(charId, "strength", "base", 16));
						Effects.insert(getSkillEffect(charId, "mul", 2));
						chai.assert.equal(6, ath());
					});

					it("should be at least highest min", function(){
						Effects.insert(getAttributeEffect(charId, "strength", "base", 16));
						Effects.insert(getSkillEffect(charId, "min", 1));
						chai.assert.equal(3, ath());
						Effects.insert(getSkillEffect(charId, "min", 5));
						chai.assert.equal(5, ath());
					});

					it("should be at most lowest max", function(){
						Effects.insert(getAttributeEffect(charId, "strength", "base", 16));
						Effects.insert(getSkillEffect(charId, "max", 5));
						chai.assert.equal(3, ath());
						Effects.insert(getSkillEffect(charId, "max", 2));
						chai.assert.equal(2, ath());
					});

					it("should be removed when the character is deleted", function(){
						Characters.remove(charId);
						var count = Effects.find({charId: charId}).count();
						chai.assert.equal(count, 0);
					});

				});
			});
		});
	});
}
