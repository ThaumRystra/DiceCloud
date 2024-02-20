import accessor from '/imports/parser/parseTree/accessor';
import array from '/imports/parser/parseTree/array';
import call from '/imports/parser/parseTree/call';
import constant from '/imports/parser/parseTree/constant';
import error from '/imports/parser/parseTree/error';
import ifNode from '/imports/parser/parseTree/if';
import index from '/imports/parser/parseTree/indexNode';
import not from '/imports/parser/parseTree/not';
import operator from '/imports/parser/parseTree/operator';
import parenthesis from '/imports/parser/parseTree/parenthesis';
import roll from '/imports/parser/parseTree/roll';
import rollArray from '/imports/parser/parseTree/rollArray';
import unaryOperator from '/imports/parser/parseTree/unaryOperator';

const factories = {
  accessor,
  array,
  call,
  constant,
  error,
  if: ifNode,
  index,
  not,
  operator,
  parenthesis,
  roll,
  rollArray,
  // What used to be symbols are now just treated as accessors without a path
  symbol: accessor,
  unaryOperator,
};

export default factories;
