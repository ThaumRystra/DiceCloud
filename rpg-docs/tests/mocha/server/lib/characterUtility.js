if (!(typeof MochaWeb === 'undefined')){
	MochaWeb.testOnly(function(){
		describe("CharacterUtility", function(){
			describe(("getMod"), function(){
				it("should return a 0 for 10 and 11", function(){
					chai.assert.equal(getMod(10), 0);
					chai.assert.equal(getMod(11), 0);
				});
				it("should return a 4 for 18 and 19", function(){
					chai.assert.equal(getMod(18), 4);
					chai.assert.equal(getMod(19), 4);
				});
				it("should return a -3 for 4 and 5", function(){
					chai.assert.equal(getMod(4), -3);
					chai.assert.equal(getMod(5), -3);
				});
			});
			describe(("signedString"), function(){
				it("should return a +1 for 1", function(){
					chai.assert.equal(signedString(1), "+1");
				});
				it("should return a +0 for 0", function(){
					chai.assert.equal(signedString(0), "+0");
				});
				it("should return a -1 for -1", function(){
					chai.assert.equal(signedString(-1), "-1");
				});
			});
		});
	});
}
