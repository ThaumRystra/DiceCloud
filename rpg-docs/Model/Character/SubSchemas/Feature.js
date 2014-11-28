Schemas.Feature = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function(){
      if(!this.isSet) return Random.id();
    }
  },
  name:       {type: String},
  description:{type: String},
  source:     {type: String},
  buffs:      {type: [Schemas.Buff], defaultValue: []},
  enabled:    {type: Boolean, defaultValue: false},
  duration:   {type: Number, optional: true},
  uses:       {type: Number, min: 0, optional: true},
  maxUses:    {type: Number, min: 0, optional: true},
  reset: {
    type: String,
    optional: true,
    allowedValues: ["longRest", "shortRest"]
  }
});
