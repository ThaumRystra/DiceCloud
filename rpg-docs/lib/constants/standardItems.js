standardItems = [
	//armor
	{
		name: "Padded Armor",
		plural: "Padded Armor",
		description: "Padded armor consists of quilted layers of cloth and batting.",
		equipmentSlot: "armor",
		weight: 8,
		value: 5,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 11,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Leather Armor",
		plural: "Leather Armor",
		description: 
		"The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil. The rest of the armor is made of softer and more flexible materials.",
		equipmentSlot: "armor",
		weight: 10,
		value: 10,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 11,
				}
			]
		}
	},
	{
		name: "Studded leather Armor",
		plural: "Studded leather Armor",
		description: 
		"Made from tough but flexible leather, studded leather is reinforced with close-set rivets or spikes.",
		equipmentSlot: "armor",
		weight: 13,
		value: 45,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 12,
				}
			]
		}
	},
	{
		name: "Hide Armor",
		plural: "Hide Armor",
		description: 
		"This crude armor consists of thick furs and pelts. It is commonly worn by barbarian tribes, evil humanoids, and other folk who lack access to the tools and materials needed to create better armor.",
		equipmentSlot: "armor",
		weight: 12,
		value: 10,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 12,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 2,
				}
			]
		}
	},
	{
		name: "Chain Shirt",
		plural: "Chain Shirts",
		description: 
		"Made of interlocking metal rings, a chain shirt is worn between layers of clothing or leather. This armor offers modest protection to the wearer’s upper body and allows the sound of the rings rubbing against one another to be muffled by outer layers.",
		equipmentSlot: "armor",
		weight: 20,
		value: 50,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 13,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 2,
				}
			]
		}
	},
	{
		name: "Scale Mail",
		plural: "Scale Mail",
		description: 
		"This armor consists of a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish. The suit includes gauntlets.",
		equipmentSlot: "armor",
		weight: 45,
		value: 50,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 14,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 2,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Breastplate",
		plural: "Breastplates",
		description: 
		"This armor consists of a fitted metal chest piece worn with supple leather. Although it leaves the legs and arms relatively unprotected, this armor provides good protection for the wearer’s vital organs while leaving the wearer relatively unencumbered.",
		equipmentSlot: "armor",
		weight: 20,
		value: 400,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 14,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 2,
				}
			]
		}
	},
	{
		name: "Half Plate",
		plural: "Half Plate",
		description: 
		"Half plate consists of shaped metal plates that cover most of the wearer’s body. It does not include leg protection beyond simple greaves that are attached with leather straps.",
		equipmentSlot: "armor",
		weight: 40,
		value: 750,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 15,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 2,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Ring Mail",
		plural: "Ring Mail",
		description: 
		"This armor is leather armor with heavy rings sewn into it. The rings help reinforce the armor against blows from swords and axes. Ring mail is inferior to chain mail, and it’s usually worn only by those who can’t afford better armor.",
		equipmentSlot: "armor",
		weight: 40,
		value: 30,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 14,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 0,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Chain Mail",
		plural: "Chain Mail",
		description: 
		"Made of interlocking metal rings, chain mail includes a layer of quilted fabric worn underneath the mail to prevent chafing and to cushion the impact of blows. The suit includes gauntlets.",
		equipmentSlot: "armor",
		weight: 55,
		value: 75,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 16,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 0,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Splint Armor",
		plural: "Splint Armor",
		description: 
		"This armor is made of narrow vertical strips of metal riveted to a backing of leather that is worn over cloth padding. Flexible chain mail protects the joints.",
		equipmentSlot: "armor",
		weight: 60,
		value: 200,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 17,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 0,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Plate Armor",
		plural: "Plate Armor",
		description: 
		"Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor. Buckles and straps distribute the weight over the body.",
		equipmentSlot: "armor",
		weight: 65,
		value: 1500,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "base",
					value: 18,
				},
				{
					stat: "dexterityArmor",
					operation: "max",
					value: 0,
				},
				{
					stat: "stealth",
					operation: "disadvantage",
					value: 1,
				}
			]
		}
	},
	{
		name: "Shield",
		plural: "Shields",
		description: 
		"A shield is made from wood or metal and is carried in one hand. Wielding a shield increases your Armor Class by 2. You can benefit from only one shield at a time.",
		equipmentSlot: "held",
		weight: 6,
		value: 10,
		feature: {
			effects: [
				{
					stat: "armor",
					operation: "add",
					value: 2,
				}
			]
		}
	},
]