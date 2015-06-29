Tracker.memoize = function(func, hasher){
	var memoize  = function(key) {
		var cache = memoize.cache;
		var address = "" + (hasher ? hasher.apply(this, arguments) : key);
		if (!_.has(cache, address)) {
			cache[address] = new CacheObject(func, address, arguments, cache, this);
		}
		return cache[address].get();
	};
	memoize.cache = {};
	return memoize;
};

function CacheObject(func, address, args, cache, context){
	var self = this;
	self.currentValue = null;
	self.dep = new Tracker.Dependency();
	self.numRun = 0;

	//spawn a new autorun that keeps the value up-to-date
	Tracker.nonreactive(function() {
		Tracker.autorun(function(computation) {
			//if this isn't the first run and nobody is listening,
			//delete itself from cache and stop the computation
			if (!computation.firstRun && !self.dep.hasDependents()){
				computation.stop();
				delete cache[address];
				return;
			}
			//if we haven't run this before this flush, reset the counter after the flush
			if(self.numRun === 0){
				Tracker.afterFlush(function(){
					self.numRun = 0;
				});
			}
			self.numRun++;
			//call the expensive function
			//even if we don't use its value, we need to track its dependencies
			var newValue = func.apply(context, args);
			//prevent dependency loops, the memoized function shouldn't re-run
			//more than once per flush
			if (self.numRun > 1){
				newValue = NaN;
				if(_.isNaN(self.currentValue)) return;
			}
			//if the value changed, store the new value
			if (self.currentValue !== newValue){
				self.currentValue = newValue;
				//tell the dependents that we've changed
				self.dep.changed();
			}
		});
	});
}

CacheObject.prototype.get = function() {
	//if there is an active computation, track dependents
	if (Tracker.active) this.dep.depend();
	return this.currentValue;
};
