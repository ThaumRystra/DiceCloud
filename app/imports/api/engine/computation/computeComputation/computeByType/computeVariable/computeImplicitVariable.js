import getAggregatorResult from './getAggregatorResult.js';

/*
 * Variables with effects, proficiencies, or damage multipliers but no defining
 * properties are added to the scope as implicit variables
 */
 export default function computeImplicitVariable(node){
   const prop = {};
   const result = getAggregatorResult(node);
   if (result !== undefined){
     prop.value = result;
   }
   if (node.data.proficiency !== undefined){
     prop.proficiency = node.data.proficiency;
   }

   // denormalise class level aggregator
   let classLevelAgg = node.data.classLevelAggregator;
   if (classLevelAgg){
     prop.level = classLevelAgg.level;
   }

   // denormalise the effect aggregator fields
   const aggregator = node.data.effectAggregator;
   if (aggregator){
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
   }

   return prop;
 }
