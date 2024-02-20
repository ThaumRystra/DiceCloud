@preprocessor esmodule
@{%
  import node from '/imports/parser/parseTree/_index';

  import moo from 'moo';

  const lexer = moo.compile({
    number: /[0-9]+(?:\.[0-9]+)?/,
    string: {
      match: /'[^']*'|"[^"]*"/,
      value: s => s.slice(1, -1).replace('\\n', '\n'),
    },
    name: {
      match: /[~#]?[a-zA-Z]*[a-ce-zA-Z][a-zA-Z0-9_]*/,
      type: moo.keywords({
        'keywords': ['true', 'false'],
      }),
    },
    space: {
      match: /\s+/,
      lineBreaks: true,
    },
    diceOperator: ['d'],
    separator: [',', ';'],
    period: ['.'],
    ifOperator: ['?'],
    elseOperator: [':'],
    multiplicativeOperator: ['*', '/'],
    exponentOperator: ['^'],
    additiveOperator: ['+', '-'],
    moduloOperator: ['%'],
    andOperator: ['&', '&&'],
    orOperator: ['|', '||'],
    stringDelimiters: ['\"', '\''],
    equalityOperator: ['=', '==', '===', '!=', '!=='],
    notOperator: ['!'],
    relationalOperator: ['>', '<', '>=', '<='],
    brackets: ['(', ')', '{', '}', '[', ']'],
  });

  function nuller() { return null; }
  function operator([left, _1, operator, _2, right], fn){
    return node.operator.create({
      left,
      right,
      operator: operator.value,
      fn
    });
  }
%}

# Use the Moo lexer
@lexer lexer

spacedExpression ->
  _ expression _ {% d => d[1] %}

expression ->
  ifStatement {% id %}

ifStatement ->
  orExpression _ %ifOperator _ orExpression _ %elseOperator _ ifStatement {%
     d => node.if.create({condition: d[0], consequent: d[4], alternative: d[8]})
  %}
| orExpression {% id %}

orExpression ->
  orExpression _ %orOperator _ andExpression {% d => operator(d, 'or') %}
| andExpression {% id %}

andExpression ->
  andExpression _ %andOperator _ equalityExpression {% d => operator(d, 'and') %}
| equalityExpression {% id %}

equalityExpression ->
  equalityExpression _ %equalityOperator _ relationalExpression {% d => operator(d, 'equality') %}
| relationalExpression {% id %}

relationalExpression ->
  relationalExpression _ %relationalOperator _ additiveExpression {% d => operator(d, 'relation') %}
| additiveExpression {% id %}

additiveExpression ->
  additiveExpression _ %additiveOperator _ remainderExpression {% d => operator(d, 'add') %}
| remainderExpression {% id %}

remainderExpression ->
  remainderExpression _ %moduloOperator _ multiplicativeExpression {% d => operator(d, 'remainder') %}
| multiplicativeExpression {% id %}

multiplicativeExpression ->
  multiplicativeExpression _ %multiplicativeOperator _ rollExpression {% d => operator(d, 'multiply') %}
| rollExpression {% id %}

rollExpression ->
  rollExpression _ %diceOperator _ exponentExpression {% d => node.roll.create({left: d[0], right: d[4]}) %}
| singleRollExpression {% id %}

singleRollExpression ->
  "d" _ singleRollExpression {% d => node.roll.create({left: node.constant.create({value: 1}), right: d[2]}) %}
| exponentExpression {% id %}

exponentExpression ->
  callExpression _ %exponentOperator _ exponentExpression {% d => operator(d, 'exponent') %}
| unaryExpression {% id %}

unaryExpression ->
  %additiveOperator _ unaryExpression {% d => node.unaryOperator.create({operator: d[0].value, right: d[2]})%}
| notExpression {% id %}

notExpression ->
  %notOperator _ notExpression {% d => node.not.create({right: d[2]})%}
| callExpression {% id %}

callExpression ->
  name _ arguments {%
    d => node.call.create({functionName: d[0].name, args: d[2]})
  %}
| indexExpression {% id %}

arguments ->
"(" _ (expression {% d => d[0] %}) ( _ %separator _ expression {% d => d[3] %} ):* _ ")" {%
  d => [d[2], ...d[3]]
  %}
| "(" _ ")" {% d => [] %}

indexExpression ->
  indexExpression "[" _ expression _ "]" {% d => node.index.create({array: d[0], index: d[3]}) %}
| arrayExpression {% id %}

arrayExpression ->
  "[" _ (expression {% d => d[0] %}) ( _ %separator _ expression {% d => d[3] %} ):* _ "]" {%
    d => node.array.create({ values: [d[2], ...d[3]] })
  %}
| "[" _ "]" {% d => node.array.create({ values: [] }) %}
| parenthesizedExpression {% id %}

parenthesizedExpression ->
  "(" _ expression _ ")" {% d => node.parenthesis.create({content: d[2]}) %}
| accessorExpression {% id %}

accessorExpression ->
  (%name {% d => d[0].value %}) ( "." keyExpression {% d => d[1] %} ):+ {%
    d=> node.accessor.create({name: d[0], path: d[1]})
  %}
| valueExpression {% id %}

keyExpression -> name {% d => d[0].name %}
| number {% d => d[0].value %}

valueExpression ->
  name {% id %}
| number {% id %}
| string {% id %}
| boolean {% id %}

# A number or a function of a number
number ->
  %number {% d => node.constant.create({value: +d[0].value}) %}

name ->
  %name {% d => node.accessor.create({name: d[0].value}) %}

string ->
  %string {% d => node.constant.create({value: d[0].value}) %}

boolean ->
  "true" {% d => node.constant.create({value: true}) %}
| "false" {% d => node.constant.create({value: false}) %}

_ ->
  null
| %space {% nuller %}
