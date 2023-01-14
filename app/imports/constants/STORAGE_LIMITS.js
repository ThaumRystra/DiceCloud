const STORAGE_LIMITS = Object.freeze({
  // String lengths
  calculation: 1024,
  collectionName: 64,
  description: 49473, //the length of the Bee Movie script
  inlineCalculationField: 49473,
  errorMessage: 256,
  icon: 10000,
  name: 128,
  summary: 10000,
  tagLength: 128,
  url: 1024,
  variableName: 64,
  spellDetail: 512,
  effectText: 512,

  // Number limits
  levelMax: 128,

  //Array counts
  ancestorCount: 100,
  damageTypeCount: 32,
  diceRollValuesCount: 100,
  errorCount: 32,
  extraTagsCount: 5,
  inlineCalculationCount: 64,
  logContentCount: 32,
  readersCount: 50,
  resourcesCount: 32,
  rollCount: 64,
  statsToTarget: 64,
  tagCount: 64,
  writersCount: 32,
  libraryCollectionCount: 32,
  pointBuyRowsCount: 32,
});

export default STORAGE_LIMITS;
