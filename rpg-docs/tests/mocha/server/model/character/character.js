if (!(typeof MochaWeb === 'undefined')){
	MochaWeb.testOnly(function(){
		var charId;
		describe("Character", function(){
			describe("insert", function(){
				it("should create a character", function(done){
					Characters.insert({owner: "FWeGYyDY5jc4HuTh8"}, function(err, id){
						charId = id;
						done(err);
					});
				});
			});			
			describe("attribute.adjustment", function(){
				Characters.insert({owner: "FWeGYyDY5jc4HuTh8"}, function(err, id){
						charId = id;
						done(err);
					});
				it("should track attribute adjustments", function(){
					Characters.update(charId, {$set: {"strength.adjustment": -12}},{},function(err, num){
						console.log(num);
						done(err);
					});
				});
				it("should report the adjusted attribute correctly", function(){
					var val = Characters.findOne(charId).attributeValue("strength");
					chai.assert.equal(val, -12);
					val = 0;
					val = Characters.findOne(charId).fieldValue("strength");
					chai.assert.equal(val, -12);
				});
			});
		});
	});
}
