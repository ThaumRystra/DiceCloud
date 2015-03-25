if (!(typeof MochaWeb === 'undefined')){
	MochaWeb.testOnly(function(){
		var charId;
		describe("Character", function(){
			describe("insert", function(){
				it("should create a character", function(){
					charId = Characters.insert({owner: "FWeGYyDY5jc4HuTh8"});
				});
			});
			describe("attribute.adjustment", function(){
				Characters.insert({owner: "FWeGYyDY5jc4HuTh8"});
				it("should track attribute adjustments", function(){
					Characters.update(charId, {$set: {"strength.adjustment": -12}});
				});
				it("should report the adjusted attribute correctly", function(){
					var val = Characters.findOne(charId).attributeValue("strength");
					chai.assert.equal(val, -12);
					val = Characters.findOne(charId).fieldValue("strength");
					chai.assert.equal(val, -12);
				});
			});
			Characters.remove({});
		});
	});
}
