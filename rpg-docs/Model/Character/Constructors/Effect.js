Effect = function(stat, value){
	this.stat = stat;
	this.value = value;
	this._id = new Mongo.ObjectID()._str;
}