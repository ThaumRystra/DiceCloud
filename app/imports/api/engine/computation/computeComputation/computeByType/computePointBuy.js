import { has } from 'lodash';
import evaluateCalculation from '../../utility/evaluateCalculation.js';

export default function computePointBuy(computation, node) {
  const prop = node.data;
  const tableMin = prop.min?.value || null;
  const tableMax = prop.max?.value || null;
  prop.spent = 0;
  prop.values?.forEach(row => {
    // Clean up added properties
    // delete row.tableId;
    // delete row.tableName;
    // delete row.type;

    row.spent = 0;
    if (row.value === undefined) return;
    const min = has(row, 'min.value') ? row.min.value : tableMin;
    const max = has(row, 'max.value') ? row.max.value : tableMax;
    const costFunction = EJSON.clone(row.cost || prop.cost);
    if (costFunction) costFunction.parseLevel = 'reduce';

    // Check min and max
    if (min !== null && row.value < min) {
      row.value = min;
    }
    if (max !== null && row.value > max) {
      row.value = max;
    }
    // Evaluate the cost function
    if (!costFunction) return;
    evaluateCalculation(costFunction, { ...computation.scope, value: row.value });
    // Write calculation errors
    costFunction.errors?.forEach(error => {
      if (error?.message) {
        row.errors = row.errors || [];
        error.message = 'Cost calculation error.\n' + error.message;
        row.errors.push(error);
      }
    });
    if (Number.isFinite(costFunction.value)) {
      row.spent = costFunction.value;
      prop.spent += costFunction.value;
    }
  });
  prop.pointsLeft = (prop.total?.value || 0) - (prop.spent || 0);
  if (prop.spent > prop.total?.value) {
    prop.errors = prop.errors || [];
    prop.errors.push({
      type: 'pointBuyError',
      message: 'Spent more than total points available',
    });
  }
}
