Character.js is under construction... expect broken character sheets

issues
------

* hot code pushes don't apply transforms correctly

Characters attributes and buffs
-------------------------------

Characters currently have attributes and skills that can take bonuses and multipliers.  
When a feature is activated or enabled on a characer or a piece of equipment is equipped
the buffs and effects should be applied to the correct attribute or skill. When the 
equipment or feature is removed or deactivated, the effects should be removed as well.

Effects need the following data as a bare minimum:

* attribute or skill to effect
* name
* value

For example, plate would be an object like this:

	{
		name: "Plate Armor" , 
		effects: [
				{stat: "skills.dexArmor.min", value: 0},
				{stat: "skills.dexArmor.max", value: 0},
				{stat: "attributes.armor.min", value: 18},
				{stat: "skills.stealth.disadvantage", value 1} //disadvantage doesn't need a value
			]
	}

See Conditions for this implemented.

The effects ultimately need to be pushed to the correct array when applied: `attributes.armor.min.push({name: "Plate Armor", type: "Equpiment", value: 18})`
They will also need to be removed correctly by the thing that applied them, or after some time.