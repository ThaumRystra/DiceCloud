import math from '/imports/math.js';
import bareSymbolSubtitutor from '/imports/api/creature/computation/utility/bareSymbolSubtitutor.js';

export default function evaluateString(string, scope){
  let errors = [];
  if (!string){
    errors.push('No string provided');
    return {result: string, errors};
  }

  if (!scope) errors.push('No scope provided');

  // Parse the string using mathjs
  let calc;
  try {
    calc = math.parse(string);
  } catch (e) {
    errors.push(e);
    return {result: string, errors};
  }

  // Replace all bare symbols with symbol.value
  let transformedCalc = calc.transform(bareSymbolSubtitutor(scope));

  // Evaluate the expression to a number or return with substitutions
  try {
    let result = transformedCalc.evaluate(scope);
    return {result, errors};
  } catch (e1){
    errors.push(e1);
    try {
      let result = simplifyWithAccessors(transformedCalc, scope).toHTML();
      return {result, errors};
    } catch (e2){
      errors.push(e2);
      return {result: transformedCalc.toHTML(), errors};
    }
  }
}

function simplifyWithAccessors(calc, scope){
  let noAccessorCalc = calc.transform(substituteAccessors(scope));
  return math.simplify(noAccessorCalc);
}

// returns a function to replace all accessors with either their resolved value
// or a symbol to simplify with
function substituteAccessors(scope){
  return function(node){
    if (node.isAccessorNode){
      try {
        return evaluateAccessor(node, scope);
      } catch (e) {
        return replaceAccessorWithSymbol(node);
      }
    } else {
      return node;
    }
  }
}

// Throws error if symbol is undefined in scope
function evaluateAccessor(node, scope){
  let value = node.evaluate(scope);
  if (value === undefined){
    throw 'Undefined symbol'
  }
  return new math.ConstantNode(value);
}

function replaceAccessorWithSymbol(node){
  let symbolNode = new math.SymbolNode(node.toString());
  return symbolNode;
}

/*
function overrideSymbolNodeHTML(symbolNode){
  let safeName = escape(symbolNode.name);
  symbolNode.toHTML = function(){
    console.log('running custom tohtml function')
    return `<span class="math-symbol math-substitution-failed">${safeName}</span>`
  }
  return symbolNode;
}

// Escape special HTML characters
// Copied directly from math.js source to help with overriding toHTML
function escape (value) {
  let text = String(value)
  text = text.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return text
}
*/
