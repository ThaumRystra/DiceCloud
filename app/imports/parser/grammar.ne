@preprocessor esmodule
@{%
  import ArrayNode from '/imports/parser/parseTree/ArrayNode.js';
	import CallNode from '/imports/parser/parseTree/CallNode.js';
	import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
  import IfNode from '/imports/parser/parseTree/IfNode.js';
	import IndexNode from '/imports/parser/parseTree/IndexNode.js';
	import OperatorNode from '/imports/parser/parseTree/OperatorNode.js';
  import ParenthesisNode from '/imports/parser/parseTree/ParenthesisNode.js';
  import RollNode from '/imports/parser/parseTree/RollNode.js';
  import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';

	import moo from 'moo';

  const lexer = moo.compile({
    number: /[0-9]+(?:\.[0-9]+)?/,
    string: {
      match: /'.*?'|".*?"/,
      value: s => s.slice(1, -1),
    },
    name: {
      match: /[a-zA-Z]+\w*?/,
      type: moo.keywords({
        'keywords': ['if', 'else', 'd'],
      }),
    },
    space: {
      match: /\s+/,
      lineBreaks: true,
    },
    separator: [',', ';'],
    period: ['.'],
    multiplicativeOperator: ['*', '/'],
    exponentOperator: ['^'],
    additiveOperator: ['+', '-'],
    unaryOperator: ['-'],
    andOperator: ['&', '&&'],
    orOperator: ['|', '||'],
    stringDelimiters: ['\"', '\''],
    equalityOperator: ['=', '==', '===', '!=', '!=='],
    relationalOperator: ['>', '<', '>=', '<='],
    brackets: ['(', ')', '{', '}', '[', ']'],
  });

  function nuller() { return null; }
  function operator([left, _1, operator, _2, right], fn){
    return new OperatorNode({
      left,
      right,
      operator: operator.value,
      fn
    });
  }
%}

# Use the Moo lexer
@lexer lexer

expression ->
  ifStatement {% d => d[0] %}

ifStatement ->
  _ expression _ "?" _ expression _ ":" _ expression {%
     d => new IfNode({condition: d[4], consequent: d[8], alternative: d[12]})
  %}
| equalityExpression {% id %}

equalityExpression ->
  equalityExpression _ %equalityOperator _ relationalExpression {% d => operator(d, 'equality') %}
| relationalExpression {% id %}

relationalExpression ->
  relationalExpression _ %relationalOperator _ orExpression {% d => operator(d, 'relation') %}
| orExpression {% id %}

orExpression ->
  orExpression _ %orOperator _ andExpression {% d => operator(d, 'or') %}
| andExpression {% id %}

andExpression ->
  andExpression _ %andOperator _ additiveExpression {% d => operator(d, 'and') %}
| additiveExpression {% id %}

additiveExpression ->
  additiveExpression _ %additiveOperator _ multiplicativeExpression {% d => operator(d, 'add') %}
| multiplicativeExpression {% id %}

multiplicativeExpression ->
  multiplicativeExpression _ %multiplicativeOperator _ rollExpression {% d => operator(d, 'multiply') %}
| rollExpression {% id %}

rollExpression ->
  rollExpression _ "d" _ exponentExpression {% d => new RollNode({left: d[0], right: d[4]}) %}
| singleRollExpression {% id %}

singleRollExpression ->
  "d" _ exponentExpression {% d => new RollNode({left: new ConstantNode({value: 1, type: 'number'}), right: d[2]}) %}
| exponentExpression {% id %}

exponentExpression ->
  callExpression _ %exponentOperator _ exponentExpression {% d => operator(d, 'exponent') %}
| callExpression {% id %}

callExpression ->
  name _ arguments {%
    d => new CallNode ({functionName: d[0].name, args: d[2]})
  %}
| indexExpression {% id %}

arguments ->
"(" _ (expression {% d => d[0] %}):? ( _ %separator _ expression {% d => d[3] %} ):* _ ")" {%
  d => [d[2], ...d[3]]
  %}

indexExpression ->
  arrayExpression "[" _ expression _ "]" {% d => new IndexNode ({array: d[0], index: d[3]}) %}
| arrayExpression {% id %}

arrayExpression ->
  "[" _ (expression {% d => d[0] %}):? ( _ %separator _ expression {% d => d[3] %} ):* _ "]" {%
    d => new ArrayNode({values: [d[2], ...d[3]]})
  %}
| parenthesizedExpression {% id %}

parenthesizedExpression ->
  "(" _ expression _ ")" {% d => new ParenthesisNode({content: d[2]}) %}
| valueExpression {% id %}

valueExpression ->
  name {% id %}
| number {% id %}
| string {% id %}

# A number or a function of a number
number ->
  %number {% d => new ConstantNode({value: +d[0].value, type: 'number'}) %}

name ->
  %name {% d => new SymbolNode({name: d[0].value}) %}

string ->
  %string {% d => new ConstantNode({value: d[0].value, type: 'string'}) %}

_ ->
  null
| %space {% nuller %}
