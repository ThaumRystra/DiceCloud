import getAggregatorResult from '/imports/api/creature/computation/newEngine/computeComputation/computeVariable/getAggregatorResult.js';

/*
 * Variables with effects, proficiencies, or damage multipliers but no defining
 * properties are added to the scope as implicit variables
 */
 export default function computeImplicitVariable(node){
   const prop = {};
   const result = getAggregatorResult(node);
   prop.total = result;
   prop.value = result;
   prop.proficiency = node.data.proficiency;

   // denormalise the aggregator fields
   const aggregator = node.data.effectAggregator;
   if (aggregator.advantage && !aggregator.disadvantage){
     prop.advantage = 1;
   } else if (aggregator.disadvantage && !aggregator.advantage){
     prop.advantage = -1;
   } else {
     prop.advantage = 0;
   }
   // Passive bonus
   prop.passiveBonus = aggregator.passiveAdd;
   // conditional benefits
   prop.conditionalBenefits = aggregator.conditional;
   // Roll bonuses
   prop.rollBonus = aggregator.rollBonus;
   // Forced to fail
   prop.fail = aggregator.fail;
   // Rollbonus
   prop.rollBonuses = aggregator.rollBonus;

   return prop;
 }
