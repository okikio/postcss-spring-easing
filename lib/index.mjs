import parser from "postcss-value-parser";
import { EasingFunctionKeys, EasingFunctions, registerEasingFunctions, CSSSpringEasing, toFixed } from "spring-easing";
function toSnake(str) {
  return str[0] + str.slice(1).replace(/[A-Z]/g, (letter) => {
    return "-" + letter.toLowerCase();
  });
}
function toCamel(str) {
  return str.replace(/-[a-z]/g, (letter) => {
    return letter[1].toUpperCase();
  });
}
const easingFns = {};
for (let name of EasingFunctionKeys) {
  easingFns[name.replace(/-/g, "").toLowerCase()] = EasingFunctions[name];
  easingFns[toSnake(name)] = EasingFunctions[name];
}
registerEasingFunctions(easingFns);
const springEasingPlugin = function(opts = {}) {
  const { easings, ...easingOpts } = opts;
  const locals = Object.assign({}, EasingFunctions);
  if (opts.easings) {
    for (let name in Object.assign({}, opts.easings)) {
      locals[name.replace(/-/g, "").toLowerCase()] = opts.easings[name];
      locals[toSnake(name)] = opts.easings[name];
    }
  }
  registerEasingFunctions(locals);
  const localKeys = Array.from(new Set(Object.keys(locals)));
  const localKeysStr = localKeys.join("|").trim();
  return {
    postcssPlugin: "postcss-spring-easing",
    Declaration(decl) {
      if (!new RegExp(localKeysStr, "i").test(decl.value))
        return;
      let root = parser(decl.value);
      let changed = false;
      root.nodes = root.nodes.map((node) => {
        let value = node.value.trim();
        const isFunction = node.type === "function";
        const isWord = node.type === "word";
        if ((isWord || isFunction) && value.length > 0 && new RegExp(`^(${localKeysStr})$`, "i").test(value)) {
          changed = true;
          const contents = isFunction ? parser.stringify(node) : value;
          const [easings2, duration] = CSSSpringEasing({
            easing: contents,
            ...easingOpts
          });
          node.type = "function";
          node.value = `linear`;
          node.nodes = parser(easings2).nodes;
          decl.before(`--spring-duration: ${toFixed(duration, 2)}ms;`);
        }
        return node;
      });
      if (changed) {
        decl.value = root.toString();
      }
    }
  };
};
const postcss = true;
springEasingPlugin.postcss = postcss;
export {
  springEasingPlugin as default,
  postcss,
  springEasingPlugin,
  toCamel,
  toSnake
};
//# sourceMappingURL=index.mjs.map
