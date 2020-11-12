// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

  import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
  import ArrayNode from '/imports/parser/parseTree/ArrayNode.js';
	import CallNode from '/imports/parser/parseTree/CallNode.js';
	import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
  import IfNode from '/imports/parser/parseTree/IfNode.js';
	import IndexNode from '/imports/parser/parseTree/IndexNode.js';
	import OperatorNode from '/imports/parser/parseTree/OperatorNode.js';
  import ParenthesisNode from '/imports/parser/parseTree/ParenthesisNode.js';
  import RollNode from '/imports/parser/parseTree/RollNode.js';
  import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
  import UnaryOperatorNode from '/imports/parser/parseTree/UnaryOperatorNode.js';
  import NotOperatorNode from '/imports/parser/parseTree/NotOperatorNode.js';

	import moo from 'moo';

  const lexer = moo.compile({
    number: /[0-9]+(?:\.[0-9]+)?/,
    string: {
      match: /'.*?'|".*?"/,
      value: s => s.slice(1, -1),
    },
    name: {
      match: /[a-zA-Z_]+/,
      type: moo.keywords({
        'keywords': ['d'],
      }),
    },
    space: {
      match: /\s+/,
      lineBreaks: true,
    },
    separator: [',', ';'],
    period: ['.'],
    ternaryOperator: ['?', ':'],
    multiplicativeOperator: ['*', '/'],
    exponentOperator: ['^'],
    additiveOperator: ['+', '-'],
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
    return new OperatorNode({
      left,
      right,
      operator: operator.value,
      fn
    });
  }
let Lexer = lexer;
let ParserRules = [
    {"name": "expression", "symbols": ["ifStatement"], "postprocess": d => d[0]},
    {"name": "ifStatement", "symbols": ["_", "equalityExpression", "_", {"literal":"?"}, "_", "equalityExpression", "_", {"literal":":"}, "_", "ifStatement"], "postprocess": 
        d => new IfNode({condition: d[1], consequent: d[5], alternative: d[9]})
          },
    {"name": "ifStatement", "symbols": ["orExpression"], "postprocess": id},
    {"name": "orExpression", "symbols": ["orExpression", "_", (lexer.has("orOperator") ? {type: "orOperator"} : orOperator), "_", "andExpression"], "postprocess": d => operator(d, 'or')},
    {"name": "orExpression", "symbols": ["andExpression"], "postprocess": id},
    {"name": "andExpression", "symbols": ["andExpression", "_", (lexer.has("andOperator") ? {type: "andOperator"} : andOperator), "_", "equalityExpression"], "postprocess": d => operator(d, 'and')},
    {"name": "andExpression", "symbols": ["equalityExpression"], "postprocess": id},
    {"name": "equalityExpression", "symbols": ["equalityExpression", "_", (lexer.has("equalityOperator") ? {type: "equalityOperator"} : equalityOperator), "_", "relationalExpression"], "postprocess": d => operator(d, 'equality')},
    {"name": "equalityExpression", "symbols": ["relationalExpression"], "postprocess": id},
    {"name": "relationalExpression", "symbols": ["relationalExpression", "_", (lexer.has("relationalOperator") ? {type: "relationalOperator"} : relationalOperator), "_", "additiveExpression"], "postprocess": d => operator(d, 'relation')},
    {"name": "relationalExpression", "symbols": ["additiveExpression"], "postprocess": id},
    {"name": "additiveExpression", "symbols": ["additiveExpression", "_", (lexer.has("additiveOperator") ? {type: "additiveOperator"} : additiveOperator), "_", "multiplicativeExpression"], "postprocess": d => operator(d, 'add')},
    {"name": "additiveExpression", "symbols": ["multiplicativeExpression"], "postprocess": id},
    {"name": "multiplicativeExpression", "symbols": ["multiplicativeExpression", "_", (lexer.has("multiplicativeOperator") ? {type: "multiplicativeOperator"} : multiplicativeOperator), "_", "rollExpression"], "postprocess": d => operator(d, 'multiply')},
    {"name": "multiplicativeExpression", "symbols": ["rollExpression"], "postprocess": id},
    {"name": "rollExpression", "symbols": ["rollExpression", "_", {"literal":"d"}, "_", "exponentExpression"], "postprocess": d => new RollNode({left: d[0], right: d[4]})},
    {"name": "rollExpression", "symbols": ["singleRollExpression"], "postprocess": id},
    {"name": "singleRollExpression", "symbols": [{"literal":"d"}, "_", "exponentExpression"], "postprocess": d => new RollNode({left: new ConstantNode({value: 1, type: 'number'}), right: d[2]})},
    {"name": "singleRollExpression", "symbols": ["exponentExpression"], "postprocess": id},
    {"name": "exponentExpression", "symbols": ["callExpression", "_", (lexer.has("exponentOperator") ? {type: "exponentOperator"} : exponentOperator), "_", "exponentExpression"], "postprocess": d => operator(d, 'exponent')},
    {"name": "exponentExpression", "symbols": ["unaryExpression"], "postprocess": id},
    {"name": "unaryExpression", "symbols": [(lexer.has("additiveOperator") ? {type: "additiveOperator"} : additiveOperator), "_", "unaryExpression"], "postprocess": d => new UnaryOperatorNode({operator: d[0].value, right: d[2]})},
    {"name": "unaryExpression", "symbols": ["notExpression"], "postprocess": id},
    {"name": "notExpression", "symbols": [(lexer.has("notOperator") ? {type: "notOperator"} : notOperator), "_", "notExpression"], "postprocess": d => new NotOperatorNode({right: d[2]})},
    {"name": "notExpression", "symbols": ["callExpression"], "postprocess": id},
    {"name": "callExpression", "symbols": ["name", "_", "arguments"], "postprocess": 
        d => new CallNode ({functionName: d[0].name, args: d[2]})
          },
    {"name": "callExpression", "symbols": ["indexExpression"], "postprocess": id},
    {"name": "arguments$ebnf$1$subexpression$1", "symbols": ["expression"], "postprocess": d => d[0]},
    {"name": "arguments$ebnf$1", "symbols": ["arguments$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "arguments$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "arguments$ebnf$2", "symbols": []},
    {"name": "arguments$ebnf$2$subexpression$1", "symbols": ["_", (lexer.has("separator") ? {type: "separator"} : separator), "_", "expression"], "postprocess": d => d[3]},
    {"name": "arguments$ebnf$2", "symbols": ["arguments$ebnf$2", "arguments$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arguments", "symbols": [{"literal":"("}, "_", "arguments$ebnf$1", "arguments$ebnf$2", "_", {"literal":")"}], "postprocess": 
        d => [d[2], ...d[3]]
        },
    {"name": "indexExpression", "symbols": ["arrayExpression", {"literal":"["}, "_", "expression", "_", {"literal":"]"}], "postprocess": d => new IndexNode ({array: d[0], index: d[3]})},
    {"name": "indexExpression", "symbols": ["arrayExpression"], "postprocess": id},
    {"name": "arrayExpression$ebnf$1$subexpression$1", "symbols": ["expression"], "postprocess": d => d[0]},
    {"name": "arrayExpression$ebnf$1", "symbols": ["arrayExpression$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "arrayExpression$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "arrayExpression$ebnf$2", "symbols": []},
    {"name": "arrayExpression$ebnf$2$subexpression$1", "symbols": ["_", (lexer.has("separator") ? {type: "separator"} : separator), "_", "expression"], "postprocess": d => d[3]},
    {"name": "arrayExpression$ebnf$2", "symbols": ["arrayExpression$ebnf$2", "arrayExpression$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "arrayExpression", "symbols": [{"literal":"["}, "_", "arrayExpression$ebnf$1", "arrayExpression$ebnf$2", "_", {"literal":"]"}], "postprocess": 
        d => new ArrayNode({values: d[2] ? [d[2], ...d[3]] : []})
          },
    {"name": "arrayExpression", "symbols": ["parenthesizedExpression"], "postprocess": id},
    {"name": "parenthesizedExpression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": d => new ParenthesisNode({content: d[2]})},
    {"name": "parenthesizedExpression", "symbols": ["accessorExpression"], "postprocess": id},
    {"name": "accessorExpression$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "name"], "postprocess": d => d[1].name},
    {"name": "accessorExpression$ebnf$1", "symbols": ["accessorExpression$ebnf$1$subexpression$1"]},
    {"name": "accessorExpression$ebnf$1$subexpression$2", "symbols": [{"literal":"."}, "name"], "postprocess": d => d[1].name},
    {"name": "accessorExpression$ebnf$1", "symbols": ["accessorExpression$ebnf$1", "accessorExpression$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "accessorExpression", "symbols": ["name", "accessorExpression$ebnf$1"], "postprocess": d=> new AccessorNode({name: d[0], path: d[1]})},
    {"name": "accessorExpression", "symbols": ["valueExpression"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["name"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["number"], "postprocess": id},
    {"name": "valueExpression", "symbols": ["string"], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => new ConstantNode({value: +d[0].value, type: 'number'})},
    {"name": "name", "symbols": [(lexer.has("name") ? {type: "name"} : name)], "postprocess": d => new SymbolNode({name: d[0].value})},
    {"name": "string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": d => new ConstantNode({value: d[0].value, type: 'string'})},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": nuller}
];
let ParserStart = "expression";
export default { Lexer, ParserRules, ParserStart };
