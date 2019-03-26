@{%
 const moo = require("moo");

 const lexer = moo.compile({
  number: /[0-9]+(?:\.[0-9]+)?/,
  name: {match: /[a-zA-Z]+\w*?/, type: moo.keywords({
    'keywords': ['if', 'else', 'd'],
  })},
  space: {match: /\s+/, lineBreaks: true},
  separators: [',', '.'],
  multiplicativeOperator: ['*', '/'],
  exponentOperator: ['^'],
  additiveOperator: ['+', '-'],
  unaryOperator: ['-'],
  andOperator: ['&', '&&'],
  orOperator: ['|', '||'],
  equalityOperator: ['=', '==', '===', '!=', '!=='],
  relationalOperator: ['>', '<', '>=', '<='],
  brackets: {match: ['(', ')', '{', '}'], value: () => null},
 });
%}

@{% function nuller() { return null; } %}

@{%
  function operator([left, _1, op, _2, right]){
    return {type: 'operation', operator: op.value, left, right};
  }
%}

# Use the Moo lexer
@lexer lexer

ifStatement ->
  "if" _ "(" _ callExpression _ ")" _ ifStatement _ "else" _ ifStatement {% d => ({condition: d[4], true: d[8], false: d[12]}) %}
| callExpression {% id %}

callExpression ->
  name _ arguments
  {%
    d => ({type: "call", function: d[0], arguments: d[2]})
  %}
| expression {% id %}

arguments ->
  "(" _ (expression {% d => d[0] %}):? ( _ "," _ expression {% d => d[3] %} ):* _ ")"
  {%
    d => [d[2], ...d[3]]
  %}

expression -> equalityExpression {% id %}

equalityExpression ->
  equalityExpression _ %equalityOperator _ relationalExpression {%operator%}
| relationalExpression {% id %}

relationalExpression ->
  relationalExpression _ %relationalOperator _ additiveExpression {%operator%}
| additiveExpression {% id %}

orExpression ->
  orExpression _ %orOperator _ andExpression {%operator%}
| andExpression {% id %}

andExpression ->
  andExpression _ %andOperator _ equalityExpression {%operator%}
| equalityExpression {% id %}

additiveExpression ->
  additiveExpression _ %additiveOperator _ rollExpression {%operator%}
| rollExpression {% id %}

rollExpression ->
  rollExpression _ "d" _ multiplicativeExpression {% operator %}
| multiplicativeExpression {% id %}

multiplicativeExpression ->
  multiplicativeExpression _ %multiplicativeOperator _ exponentExpression {%operator%}
| exponentExpression {% id %}

exponentExpression ->
  exponentExpression _ %exponentOperator _ valueExpression {%operator%}
| valueExpression {% id %}

valueExpression ->
  name {% id %}
| number {% id %}

# A number or a function of a number
number ->
  %number {% d => d[0].value %}

name ->
  %name {% d => d[0].value %}

_ ->
  null
| %space {% nuller %}
