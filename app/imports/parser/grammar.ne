@{%
  const moo = require("moo");

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
    separators: [',', '.'],
    multiplicativeOperator: ['*', '/'],
    exponentOperator: ['^'],
    additiveOperator: ['+', '-'],
    unaryOperator: ['-'],
    andOperator: ['&', '&&'],
    orOperator: ['|', '||'],
    stringDelimiters: ['\"', '\''],
    equalityOperator: ['=', '==', '===', '!=', '!=='],
    relationalOperator: ['>', '<', '>=', '<='],
    brackets: ['(', ')', '{', '}'],
  });

  function nuller() { return null; }

  class OperatorNode {
    constructor({left, right, operator, fn}) {
      this.left = left;
      this.right = right;
      this.fn = fn;
      this.operator = operator;
    }
  }
  function operator([left, _1, operator, _2, right], fn){
    return new OperatorNode({
      left,
      right,
      operator: operator.value,
      fn
    });
  }

  class SymbolNode {
    constructor(name){
      this.name = name;
    }
  }

  class ConstantNode {
    constructor(value, type){
      this.type = type;
      this.value = value;
    }
  }
%}

# Use the Moo lexer
@lexer lexer

ifStatement ->
  "if" _ "(" _ expression _ ")" _ ifStatement _ "else" _ ifStatement {% d => ({condition: d[4], true: d[8], false: d[12]}) %}
| expression {% id %}

expression ->
  equalityExpression {% d => d[0] %}

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
  rollExpression _ "d" _ exponentExpression {% d => operator(d, 'roll') %}
| exponentExpression {% id %}

exponentExpression ->
  callExpression _ %exponentOperator _ exponentExpression {% d => operator(d, 'exponent') %}
| callExpression {% id %}

callExpression ->
  name _ arguments {%
    d => ({type: "call", function: d[0], arguments: d[2]})
  %}
| parenthesizedExpression {% id %}

arguments ->
  "(" _ (expression {% d => d[0] %}):? ( _ "," _ expression {% d => d[3] %} ):* _ ")" {%
    d => [d[2], ...d[3]]
  %}

parenthesizedExpression ->
  "(" _ expression _ ")" {% d => d[2] %}
| valueExpression {% id %}

valueExpression ->
  name {% id %}
| number {% id %}
| string {% id %}

# A number or a function of a number
number ->
  %number {% d => new ConstantNode(d[0].value, 'number') %}

name ->
  %name {% d => new SymbolNode(d[0].value) %}

string ->
  %string {% d => new ConstantNode(d[0].value, 'string') %}

_ ->
  null
| %space {% nuller %}
