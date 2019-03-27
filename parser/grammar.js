// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

 const moo = require("moo");

 const lexer = moo.compile({
  number: /[0-9]+(?:\.[0-9]+)?/,
  string: /'.*?'|".*?"/,
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
      this.value = value;
      this.type = type;
    }
  }
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "ifStatement", "symbols": [{"literal":"if"}, "_", {"literal":"("}, "_", "expression", "_", {"literal":")"}, "_", "ifStatement", "_", {"literal":"else"}, "_", "ifStatement"], "postprocess": d => ({condition: d[4], true: d[8], false: d[12]})},
    {"name": "ifStatement", "symbols": ["expression"], "postprocess": id},
    {"name": "expression", "symbols": ["equalityExpression"], "postprocess": d => d[0]},
    {"name": "equalityExpression", "symbols": ["equalityExpression", "_", (lexer.has("equalityOperator") ? {type: "equalityOperator"} : equalityOperator), "_", "relationalExpression"], "postprocess": d => operator(d, 'equality')},
    {"name": "equalityExpression", "symbols": ["relationalExpression"], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["relationalExpression", "_", (lexer.has("relationalOperator") ? {type: "relationalOperator"} : relationalOperator), "_", "orExpression"], "postprocess": d => operator(d, 'relation')},
    {"name": "relationalExpression", "symbols": ["orExpression"], "postprocess": id},
    {"name": "orExpression", "symbols": ["orExpression", "_", (lexer.has("orOperator") ? {type: "orOperator"} : orOperator), "_", "andExpression"], "postprocess": d => operator(d, 'or')},
    {"name": "orExpression", "symbols": ["andExpression"], "postprocess": id},
    {"name": "andExpression", "symbols": ["andExpression", "_", (lexer.has("andOperator") ? {type: "andOperator"} : andOperator), "_", "additiveExpression"], "postprocess": d => operator(d, 'and')},
    {"name": "andExpression", "symbols": ["additiveExpression"], "postprocess": id},
    {"name": "additiveExpression", "symbols": ["additiveExpression", "_", (lexer.has("additiveOperator") ? {type: "additiveOperator"} : additiveOperator), "_", "multiplicativeExpression"], "postprocess": d => operator(d, 'add')},
    {"name": "additiveExpression", "symbols": ["multiplicativeExpression"], "postprocess": id},
    {"name": "multiplicativeExpression", "symbols": ["multiplicativeExpression", "_", (lexer.has("multiplicativeOperator") ? {type: "multiplicativeOperator"} : multiplicativeOperator), "_", "rollExpression"], "postprocess": d => operator(d, 'multiply')},
    {"name": "multiplicativeExpression", "symbols": ["rollExpression"], "postprocess": id},
    {"name": "rollExpression", "symbols": ["rollExpression", "_", {"literal":"d"}, "_", "exponentExpression"], "postprocess": d => operator(d, 'roll')},
    {"name": "rollExpression", "symbols": ["exponentExpression"], "postprocess": id},
    {"name": "exponentExpression", "symbols": ["callExpression", "_", (lexer.has("exponentOperator") ? {type: "exponentOperator"} : exponentOperator), "_", "exponentExpression"], "postprocess": d => operator(d, 'exponent')},
    {"name": "exponentExpression", "symbols": ["callExpression"], "postprocess": id},
    {"name": "callExpression", "symbols": ["name", "_", "arguments"], "postprocess": 
        d => ({type: "call", function: d[0], arguments: d[2]})
          },
    {"name": "callExpression", "symbols": ["parenthesizedExpression"], "postprocess": id},
    {"name": "arguments$ebnf$1$subexpression$1", "symbols": ["expression"], "postprocess": d => d[0]},
    {"name": "arguments$ebnf$1", "symbols": ["arguments$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "arguments$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "arguments$ebnf$2", "symbols": []},
    {"name": "arguments$ebnf$2$subexpression$1", "symbols": ["_", {"literal":","}, "_", "expression"], "postprocess": d => d[3]},
    {"name": "arguments$ebnf$2", "symbols": ["arguments$ebnf$2", "arguments$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arguments", "symbols": [{"literal":"("}, "_", "arguments$ebnf$1", "arguments$ebnf$2", "_", {"literal":")"}], "postprocess": 
        d => [d[2], ...d[3]]
          },
    {"name": "parenthesizedExpression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": d => d[2]},
    {"name": "parenthesizedExpression", "symbols": ["valueExpression"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["name"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["number"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["string"], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => new ConstantNode(d[0].value, 'number')},
    {"name": "name", "symbols": [(lexer.has("name") ? {type: "name"} : name)], "postprocess": d => new SymbolNode(d[0].value)},
    {"name": "string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": d => new ConstantNode(d[0].value, 'string')},
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
