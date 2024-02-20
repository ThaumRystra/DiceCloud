// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

import node from '/imports/parser/parseTree/';

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
function operator([left, _1, operator, _2, right], fn) {
  return node.operator.create({
    left,
    right,
    operator: operator.value,
    fn
  });
}
let Lexer = lexer;
let ParserRules = [
  { "name": "spacedExpression", "symbols": ["_", "expression", "_"], "postprocess": d => d[1] },
  { "name": "expression", "symbols": ["ifStatement"], "postprocess": id },
  {
    "name": "ifStatement", "symbols": ["orExpression", "_", (lexer.has("ifOperator") ? { type: "ifOperator" } : ifOperator), "_", "orExpression", "_", (lexer.has("elseOperator") ? { type: "elseOperator" } : elseOperator), "_", "ifStatement"], "postprocess":
      d => node.if.create({ condition: d[0], consequent: d[4], alternative: d[8] })
  },
  { "name": "ifStatement", "symbols": ["orExpression"], "postprocess": id },
  { "name": "orExpression", "symbols": ["orExpression", "_", (lexer.has("orOperator") ? { type: "orOperator" } : orOperator), "_", "andExpression"], "postprocess": d => operator(d, 'or') },
  { "name": "orExpression", "symbols": ["andExpression"], "postprocess": id },
  { "name": "andExpression", "symbols": ["andExpression", "_", (lexer.has("andOperator") ? { type: "andOperator" } : andOperator), "_", "equalityExpression"], "postprocess": d => operator(d, 'and') },
  { "name": "andExpression", "symbols": ["equalityExpression"], "postprocess": id },
  { "name": "equalityExpression", "symbols": ["equalityExpression", "_", (lexer.has("equalityOperator") ? { type: "equalityOperator" } : equalityOperator), "_", "relationalExpression"], "postprocess": d => operator(d, 'equality') },
  { "name": "equalityExpression", "symbols": ["relationalExpression"], "postprocess": id },
  { "name": "relationalExpression", "symbols": ["relationalExpression", "_", (lexer.has("relationalOperator") ? { type: "relationalOperator" } : relationalOperator), "_", "additiveExpression"], "postprocess": d => operator(d, 'relation') },
  { "name": "relationalExpression", "symbols": ["additiveExpression"], "postprocess": id },
  { "name": "additiveExpression", "symbols": ["additiveExpression", "_", (lexer.has("additiveOperator") ? { type: "additiveOperator" } : additiveOperator), "_", "remainderExpression"], "postprocess": d => operator(d, 'add') },
  { "name": "additiveExpression", "symbols": ["remainderExpression"], "postprocess": id },
  { "name": "remainderExpression", "symbols": ["remainderExpression", "_", (lexer.has("moduloOperator") ? { type: "moduloOperator" } : moduloOperator), "_", "multiplicativeExpression"], "postprocess": d => operator(d, 'remainder') },
  { "name": "remainderExpression", "symbols": ["multiplicativeExpression"], "postprocess": id },
  { "name": "multiplicativeExpression", "symbols": ["multiplicativeExpression", "_", (lexer.has("multiplicativeOperator") ? { type: "multiplicativeOperator" } : multiplicativeOperator), "_", "rollExpression"], "postprocess": d => operator(d, 'multiply') },
  { "name": "multiplicativeExpression", "symbols": ["rollExpression"], "postprocess": id },
  { "name": "rollExpression", "symbols": ["rollExpression", "_", (lexer.has("diceOperator") ? { type: "diceOperator" } : diceOperator), "_", "exponentExpression"], "postprocess": d => node.roll.create({ left: d[0], right: d[4] }) },
  { "name": "rollExpression", "symbols": ["singleRollExpression"], "postprocess": id },
  { "name": "singleRollExpression", "symbols": [{ "literal": "d" }, "_", "singleRollExpression"], "postprocess": d => node.roll.create({ left: node.constant.create({ value: 1 }), right: d[2] }) },
  { "name": "singleRollExpression", "symbols": ["exponentExpression"], "postprocess": id },
  { "name": "exponentExpression", "symbols": ["callExpression", "_", (lexer.has("exponentOperator") ? { type: "exponentOperator" } : exponentOperator), "_", "exponentExpression"], "postprocess": d => operator(d, 'exponent') },
  { "name": "exponentExpression", "symbols": ["unaryExpression"], "postprocess": id },
  { "name": "unaryExpression", "symbols": [(lexer.has("additiveOperator") ? { type: "additiveOperator" } : additiveOperator), "_", "unaryExpression"], "postprocess": d => node.unaryOperator.create({ operator: d[0].value, right: d[2] }) },
  { "name": "unaryExpression", "symbols": ["notExpression"], "postprocess": id },
  { "name": "notExpression", "symbols": [(lexer.has("notOperator") ? { type: "notOperator" } : notOperator), "_", "notExpression"], "postprocess": d => node.not.create({ right: d[2] }) },
  { "name": "notExpression", "symbols": ["callExpression"], "postprocess": id },
  {
    "name": "callExpression", "symbols": ["name", "_", "arguments"], "postprocess":
      d => node.call.create({ functionName: d[0].name, args: d[2] })
  },
  { "name": "callExpression", "symbols": ["indexExpression"], "postprocess": id },
  { "name": "arguments$subexpression$1", "symbols": ["expression"], "postprocess": d => d[0] },
  { "name": "arguments$ebnf$1", "symbols": [] },
  { "name": "arguments$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("separator") ? { type: "separator" } : separator), "_", "expression"], "postprocess": d => d[3] },
  { "name": "arguments$ebnf$1", "symbols": ["arguments$ebnf$1", "arguments$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
  {
    "name": "arguments", "symbols": [{ "literal": "(" }, "_", "arguments$subexpression$1", "arguments$ebnf$1", "_", { "literal": ")" }], "postprocess":
      d => [d[2], ...d[3]]
  },
  { "name": "arguments", "symbols": [{ "literal": "(" }, "_", { "literal": ")" }], "postprocess": d => [] },
  { "name": "indexExpression", "symbols": ["indexExpression", { "literal": "[" }, "_", "expression", "_", { "literal": "]" }], "postprocess": d => node.index.create({ array: d[0], index: d[3] }) },
  { "name": "indexExpression", "symbols": ["arrayExpression"], "postprocess": id },
  { "name": "arrayExpression$subexpression$1", "symbols": ["expression"], "postprocess": d => d[0] },
  { "name": "arrayExpression$ebnf$1", "symbols": [] },
  { "name": "arrayExpression$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("separator") ? { type: "separator" } : separator), "_", "expression"], "postprocess": d => d[3] },
  { "name": "arrayExpression$ebnf$1", "symbols": ["arrayExpression$ebnf$1", "arrayExpression$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
  {
    "name": "arrayExpression", "symbols": [{ "literal": "[" }, "_", "arrayExpression$subexpression$1", "arrayExpression$ebnf$1", "_", { "literal": "]" }], "postprocess":
      d => node.array.create({ values: [d[2], ...d[3]] })
  },
  { "name": "arrayExpression", "symbols": [{ "literal": "[" }, "_", { "literal": "]" }], "postprocess": d => node.array.create({ values: [] }) },
  { "name": "arrayExpression", "symbols": ["parenthesizedExpression"], "postprocess": id },
  { "name": "parenthesizedExpression", "symbols": [{ "literal": "(" }, "_", "expression", "_", { "literal": ")" }], "postprocess": d => node.parenthesis.create({ content: d[2] }) },
  { "name": "parenthesizedExpression", "symbols": ["accessorExpression"], "postprocess": id },
  { "name": "accessorExpression$subexpression$1", "symbols": [(lexer.has("name") ? { type: "name" } : name)], "postprocess": d => d[0].value },
  { "name": "accessorExpression$ebnf$1$subexpression$1", "symbols": [{ "literal": "." }, "keyExpression"], "postprocess": d => d[1] },
  { "name": "accessorExpression$ebnf$1", "symbols": ["accessorExpression$ebnf$1$subexpression$1"] },
  { "name": "accessorExpression$ebnf$1$subexpression$2", "symbols": [{ "literal": "." }, "keyExpression"], "postprocess": d => d[1] },
  { "name": "accessorExpression$ebnf$1", "symbols": ["accessorExpression$ebnf$1", "accessorExpression$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
  {
    "name": "accessorExpression", "symbols": ["accessorExpression$subexpression$1", "accessorExpression$ebnf$1"], "postprocess":
      d => node.accessor.create({ name: d[0], path: d[1] })
  },
  { "name": "accessorExpression", "symbols": ["valueExpression"], "postprocess": id },
  { "name": "keyExpression", "symbols": ["name"], "postprocess": d => d[0].name },
  { "name": "keyExpression", "symbols": ["number"], "postprocess": d => d[0].value },
  { "name": "valueExpression", "symbols": ["name"], "postprocess": id },
  { "name": "valueExpression", "symbols": ["number"], "postprocess": id },
  { "name": "valueExpression", "symbols": ["string"], "postprocess": id },
  { "name": "valueExpression", "symbols": ["boolean"], "postprocess": id },
  { "name": "number", "symbols": [(lexer.has("number") ? { type: "number" } : number)], "postprocess": d => node.constant.create({ value: +d[0].value }) },
  { "name": "name", "symbols": [(lexer.has("name") ? { type: "name" } : name)], "postprocess": d => node.accessor.create({ name: d[0].value }) },
  { "name": "string", "symbols": [(lexer.has("string") ? { type: "string" } : string)], "postprocess": d => node.constant.create({ value: d[0].value }) },
  { "name": "boolean", "symbols": [{ "literal": "true" }], "postprocess": d => node.constant.create({ value: true }) },
  { "name": "boolean", "symbols": [{ "literal": "false" }], "postprocess": d => node.constant.create({ value: false }) },
  { "name": "_", "symbols": [] },
  { "name": "_", "symbols": [(lexer.has("space") ? { type: "space" } : space)], "postprocess": nuller }
];
let ParserStart = "spacedExpression";
export default { Lexer, ParserRules, ParserStart };
