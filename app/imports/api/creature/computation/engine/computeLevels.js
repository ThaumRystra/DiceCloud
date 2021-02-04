import { forOwn, has, union } from 'lodash';

export default function computeLevels(memo){
  computeClassLevels(memo);
  computeTotalLevel(memo);
}

function computeClassLevels(memo){
  forOwn(memo.classLevelsById, classLevel => {
    //  class levels are mutually dependent
    classLevel.dependencies = union(
      classLevel.dependencies,
      Object.keys(memo.classLevelsById)
    );
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
      dependencies: [],
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
    let cls = memo.classes[name];
    level += cls.level || 0;
    if (cls._id){
      currentLevel.dependencies = union(
        currentLevel.dependencies,
        [cls._id]
      )
    }
    if (cls.dependencies){
      currentLevel.dependencies = union(
        currentLevel.dependencies,
        cls.dependencies,
      )
    }
  }
  currentLevel.value = level;
}
