var getEffect = function(charId, op, value){
	return {
		charId: charId,
		type: "inate",
		stat: "constitution",
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
			Effects.remove({});
			Characters.remove({});
			var charId = Characters.insert({owner: "FWeGYyDY5jc4HuTh8"});
			var char  = Characters.findOne(charId);
			var con = function(){return char.attributeValue("constitution")};

			describe("effects", function(){
				describe("attributeValue", function(){
					
					it("should be set to highest base", function(done){
						Effects.insert(getEffect(charId, "base", 10), function(err, id){
							if(err) done(err);
						});
						Effects.insert(getEffect(charId, "base", 6), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(10, con());
						done();
					});

					it("should add", function(done){
						Effects.insert(getEffect(charId, "add", 2), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(12, con());
						done();
					});

					it("should multiply", function(done){
						Effects.insert(getEffect(charId, "mul", 2), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(24, con());
						done();
					});

					it("should be at least highest min", function(done){
						Effects.insert(getEffect(charId, "min", 22), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(con(), 24);
						Effects.insert(getEffect(charId, "min", 28), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(28, con());
						done();
					});

					it("should be at most lowest max", function(done){
						Effects.insert(getEffect(charId, "max", 30), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(28, con());
						Effects.insert(getEffect(charId, "max", 5), function(err, id){
							if(err) done(err);
						});
						chai.assert.equal(5, con());
						done();
					});

					it("should respect adjustment", function(done){
						Characters.update(charId, {$set: {"constitution.adjustment": -2}}, function(err, num){
							if(err) done(err);
						})
						chai.assert.equal(3, con());
						var conBase = char.attributeBase("constitution");
						chai.assert.equal(5, conBase)
						done();
					});
					
					it("should be removed when the character is deleted", function(){
						Characters.remove(charId);
						var count = Effects.find({charId: charId}).count();
						chai.assert.equal(count, 0);
					})

				});
			});
		});
	});
}
