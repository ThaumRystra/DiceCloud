const STORAGE_LIMITS = Object.freeze({
  // String lengths
  calculation: 256,
  collectionName: 64,
  color: 10000,
  description: 49473, //the length of the Bee Movie script
  inlineCalculationField: 49473,
  errorMessage: 256,
  icon: 10000,
  name: 128,
  summary: 10000,
  tagLength: 128,
  url: 256,
  variableName: 64,

  //Array counts
  ancestorCount: 100,
  damageTypeCount: 32,
  diceRollValuesCount: 100,
  errorCount: 32,
  extraTagsCount: 5,
  inlineCalculationCount: 32,
  logContentCount: 32,
  readersCount: 50,
  resourcesCount: 32,
  rollCount: 64,
  rollBonusCount: 32,
  statsToTarget: 32,
  tagCount: 64,
  writersCount: 20,
});

export default STORAGE_LIMITS;
