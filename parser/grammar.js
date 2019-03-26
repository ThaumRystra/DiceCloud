// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

 function nuller() { return null; } 

  function operator([left, _1, op, _2, right]){
    return {type: 'operation', operator: op.value, left, right};
  }
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "ifStatement", "symbols": [{"literal":"if"}, "_", {"literal":"("}, "_", "callExpression", "_", {"literal":")"}, "_", "ifStatement", "_", {"literal":"else"}, "_", "ifStatement"], "postprocess": d => ({condition: d[4], true: d[8], false: d[12]})},
    {"name": "ifStatement", "symbols": ["callExpression"], "postprocess": id},
    {"name": "callExpression", "symbols": ["name", "_", "arguments"], "postprocess": 
        d => ({type: "call", function: d[0], arguments: d[2]})
          },
    {"name": "callExpression", "symbols": ["expression"], "postprocess": id},
    {"name": "arguments$ebnf$1$subexpression$1", "symbols": ["expression"], "postprocess": d => d[0]},
    {"name": "arguments$ebnf$1", "symbols": ["arguments$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "arguments$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "arguments$ebnf$2", "symbols": []},
    {"name": "arguments$ebnf$2$subexpression$1", "symbols": ["_", {"literal":","}, "_", "expression"], "postprocess": d => d[3]},
    {"name": "arguments$ebnf$2", "symbols": ["arguments$ebnf$2", "arguments$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arguments", "symbols": [{"literal":"("}, "_", "arguments$ebnf$1", "arguments$ebnf$2", "_", {"literal":")"}], "postprocess": 
        d => [d[2], ...d[3]]
          },
    {"name": "expression", "symbols": ["equalityExpression"], "postprocess": id},
    {"name": "equalityExpression", "symbols": ["equalityExpression", "_", (lexer.has("equalityOperator") ? {type: "equalityOperator"} : equalityOperator), "_", "relationalExpression"], "postprocess": operator},
    {"name": "equalityExpression", "symbols": ["relationalExpression"], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["relationalExpression", "_", (lexer.has("relationalOperator") ? {type: "relationalOperator"} : relationalOperator), "_", "additiveExpression"], "postprocess": operator},
    {"name": "relationalExpression", "symbols": ["additiveExpression"], "postprocess": id},
    {"name": "orExpression", "symbols": ["orExpression", "_", (lexer.has("orOperator") ? {type: "orOperator"} : orOperator), "_", "andExpression"], "postprocess": operator},
    {"name": "orExpression", "symbols": ["andExpression"], "postprocess": id},
    {"name": "andExpression", "symbols": ["andExpression", "_", (lexer.has("andOperator") ? {type: "andOperator"} : andOperator), "_", "equalityExpression"], "postprocess": operator},
    {"name": "andExpression", "symbols": ["equalityExpression"], "postprocess": id},
    {"name": "additiveExpression", "symbols": ["additiveExpression", "_", (lexer.has("additiveOperator") ? {type: "additiveOperator"} : additiveOperator), "_", "rollExpression"], "postprocess": operator},
    {"name": "additiveExpression", "symbols": ["rollExpression"], "postprocess": id},
    {"name": "rollExpression", "symbols": ["rollExpression", "_", {"literal":"d"}, "_", "multiplicativeExpression"], "postprocess": operator},
    {"name": "rollExpression", "symbols": ["multiplicativeExpression"], "postprocess": id},
    {"name": "multiplicativeExpression", "symbols": ["multiplicativeExpression", "_", (lexer.has("multiplicativeOperator") ? {type: "multiplicativeOperator"} : multiplicativeOperator), "_", "exponentExpression"], "postprocess": operator},
    {"name": "multiplicativeExpression", "symbols": ["exponentExpression"], "postprocess": id},
    {"name": "exponentExpression", "symbols": ["exponentExpression", "_", (lexer.has("exponentOperator") ? {type: "exponentOperator"} : exponentOperator), "_", "valueExpression"], "postprocess": operator},
    {"name": "exponentExpression", "symbols": ["valueExpression"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["name"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["number"], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => d[0].value},
    {"name": "name", "symbols": [(lexer.has("name") ? {type: "name"} : name)], "postprocess": d => d[0].value},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": nuller}
]
  , ParserStart: "ifStatement"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
