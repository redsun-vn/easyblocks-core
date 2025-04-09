/* with love from shopstory */
import valueParser from 'postcss-value-parser';
import parser_1 from './parser.js';
import { reducer as reduce } from './lib/reducer.js';
import { stringifier } from './lib/stringifier.js';

const MATCH_CALC = /((?:\-[a-z]+\-)?calc)/;
function calculateAllViewportValues(ast, map) {
  if (typeof ast === "object" && ast !== null) {
    if (ast.type === "VwValue" && ast.unit === "vw" && typeof map.vw === "number") {
      return {
        type: "LengthValue",
        unit: "px",
        value: ast.value / 100 * map.vw
      };
    } else if (ast.type === "PercentageValue" && ast.unit === "%" && typeof map.percent === "number") {
      return {
        type: "LengthValue",
        unit: "px",
        value: ast.value / 100 * map.percent
      };
    } else {
      for (const key in ast) {
        if (typeof ast[key] === "object" && ast[key] !== null) {
          ast[key] = calculateAllViewportValues(ast[key], map);
        }
      }
    }
  }
  return ast;
}
function reduceCSSCalc(value) {
  let precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  let map = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return valueParser(value).walk(node => {
    // skip anything which isn't a calc() function
    if (node.type !== "function" || !MATCH_CALC.test(node.value)) return;

    // stringify calc expression and produce an AST
    const contents = valueParser.stringify(node.nodes);

    // skip constant() and env()
    if (contents.indexOf("constant") >= 0 || contents.indexOf("env") >= 0) return;
    const ast = calculateAllViewportValues(parser_1.parser.parse(contents), map);

    // reduce AST to its simplest form, that is, either to a single value
    // or a simplified calc expression
    const reducedAst = reduce(ast, precision);

    // stringify AST and write it back
    node.type = "word";
    node.value = stringifier(node.value, reducedAst, precision);
  }, true).toString();
}

export { reduceCSSCalc };
//# sourceMappingURL=index.js.map
