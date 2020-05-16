import { forOwn, has } from 'lodash';

export default function computeLevels(memo){
  computeClassLevels(memo);
  computeTotalLevel(memo);
}

function computeClassLevels(memo){
  forOwn(memo.classLevelsById, classLevel => {
    let name = classLevel.variableName;
    let stat = memo.statsByVariableName[name];
    if (!stat){
      memo.statsByVariableName[name] = classLevel;
      memo.classes[name] = classLevel;
    } else if (!has(stat, 'level')){
      // Stat is overriden by an attribute
      return;
    } else if (stat.level < classLevel.level) {
      memo.statsByVariableName[name] = classLevel;
      memo.classes[name] = classLevel;
    }
  });
}

function computeTotalLevel(memo){
  let currentLevel = memo.statsByVariableName['level'];
  if (!currentLevel){
    currentLevel = {
      value: 0,
      computationDetails: {
        builtIn: true,
        computed: true,
      }
    };
    memo.statsByVariableName['level'] = currentLevel;
  }
  // bail out if overriden by an attribute
  if (!currentLevel.computationDetails.builtIn) return;
  let level = 0;
  for (let name in memo.classes){
    level += memo.classes[name].level || 0;
  }
  memo.statsByVariableName['level'].value = level;
}
