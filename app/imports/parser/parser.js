import grammar from '/imports/parser/grammar.js';
import nearley from 'nearley';

const nearleyGrammar = nearley.Grammar.fromCompiled(grammar);

export default function parser(){
  return new nearley.Parser(nearleyGrammar);
}
