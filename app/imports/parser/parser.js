import grammar from '/imports/parser/grammar.js';
import nearley from 'nearley';

const nearleyGrammar = nearley.Grammar.fromCompiled(grammar);

export default function parser(){
  return new nearley.Parser(nearleyGrammar);
}

export function parse(string){
  let parser = new nearley.Parser(nearleyGrammar);
  parser.feed(string);
  let results = parser.results;
  if (results.length === 1){
    return results[0];
  } else if (results.length === 0){
    // Valid parsing up until now, but need more
    throw new EndOfInputError('Unexpected end of input');
  } else {
    console.warn('Grammar is ambiguous!', {string, results});
    return results[0];
  }
}

export function prettifyParseError(e){
  if (e.message) e = e.message
  return e.toString().split('.')[0];
}

class EndOfInputError extends Error {
  constructor(message = '', ...args) {
    super(message, ...args);
  }
}
