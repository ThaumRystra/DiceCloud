import DEFAULT_CHARACTER_DOCS from '/imports/api/creature/DEFAULT_CHARACTER_DOCS.js';
import { Random } from 'meteor/random';

const setParent = function(charId){
	let parent = {
		collection: "Creatures",
		id: charId,
		group: "default",
	};
	return doc => {
		doc.parent = parent;
		doc.charId = charId;
	};
};

const getRacialBonusEffect = function(charId, attribute, bonus){
	return {
		name: "Race Bonus",
		stat: attribute,
		operation: "add",
		value: bonus,
		parent: {
			collection: "Creatures",
			id: charId,
			group: "racial",
		},
		charId: charId,
	};
};

const giveDocsOrderAndIds = function(docArray){
	for (i in docArray){
		docArray[i].order = +i;
		if (!docArray[i]._id){
			docArray[i]._id = Random.id();
		}
	}
};

const getDefaultCharacterDocs = function(charId, {
	// Character form data
	baseStrength = 10,
	baseDexterity = 10,
	baseConstitution = 10,
	baseIntelligence = 10,
	baseWisdom = 10,
	baseCharisma = 10,
	strengthBonus = 0,
	dexterityBonus = 0,
	constitutionBonus = 0,
	intelligenceBonus = 0,
	wisdomBonus = 0,
	charismaBonus = 0,
	hitDice = "d8",
	cls = "Class",
  level = 1,
}){
	let docs = DEFAULT_CHARACTER_DOCS();

	// Setup the base ability scores
	docs.attributes[0].baseValue = baseStrength;
	docs.attributes[1].baseValue = baseDexterity;
	docs.attributes[2].baseValue = baseConstitution;
	docs.attributes[3].baseValue = baseIntelligence;
	docs.attributes[4].baseValue = baseWisdom;
	docs.attributes[5].baseValue = baseCharisma;

	// Set up racial bonuses
	if (strengthBonus) {
		docs.effects.push(
			getRacialBonusEffect(charId, 'strength', strengthBonus)
		);
	}
	if (dexterityBonus) {
		docs.effects.push(
			getRacialBonusEffect(charId, 'dexterity', dexterityBonus)
		);
	}
	if (constitutionBonus) {
		docs.effects.push(
			getRacialBonusEffect(charId, 'constitution', constitutionBonus)
		);
	}
	if (intelligenceBonus) {
		docs.effects.push(
			getRacialBonusEffect(charId, 'intelligence', intelligenceBonus)
		);
	}
	if (wisdomBonus) {
		docs.effects.push(
			getRacialBonusEffect(charId, 'wisdom', wisdomBonus)
		);
	}
	if (charismaBonus) {
		docs.effects.push(
			getRacialBonusEffect(charId, 'charisma', charismaBonus)
		);
	}

	// Set up Class
  const strippedCls = cls.replace(/\s+/g, '')
  const classId = Random.id();
	docs.classes = [{
		charId,
    level,
		name: cls,
	}];

  // Setup hit dice
  docs.effects.push({
		name: cls,
		stat: `${hitDice}HitDice`,
		operation: "add",
		calculation: `${strippedCls}Level`,
		parent: {
			collection: "Classes",
			id: classId,
		},
		charId: charId,
	});

  // Setup health for all class levels
  let healthPerLevel = 4;
  if (hitDice == "d6"){
    healthPerLevel = 4;
  } else if (hitDice == "d8"){
    healthPerLevel = 5;
  } else if (hitDice == "d10"){
    healthPerLevel = 6;
  } else if (hitDice == "d12"){
    healthPerLevel = 7;
  }
  docs.effects.push({
		name: cls,
		stat: `${hitDice}HitDice`,
		operation: "add",
		calculation: `${healthPerLevel - 2} + ${healthPerLevel} * ${strippedCls}Level`,
		parent: {
			collection: "Classes",
			id: classId,
		},
		charId: charId,
	});

	// Set the parents for base items
	docs.attributes.forEach(setParent(charId));
	docs.skills.forEach(setParent(charId));
	docs.damageMultipliers.forEach(setParent(charId));
	docs.effects.forEach(setParent(charId));
	docs.containers.forEach(setParent(charId));

	// Set up parenting on items and move them to the top level items object
	docs.items = [];
	docs.containers.forEach(container => {
		container._id = Random.id();
		const parent = {
			collection: "Containers",
			id: container._id,
		};
		container.items.forEach(item => {
			item.parent = parent;
			item.charId = charId;
		});
		// Move the items to the top level array
		docs.items.push(...container.items);
		delete container.items;
	});

	// Order the docs
	for (collection in docs){
		giveDocsOrderAndIds(docs[collection]);
	}

	return docs
};

export default getDefaultCharacterDocs;
