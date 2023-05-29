(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("postcss-value-parser"), require("spring-easing")) : typeof define === "function" && define.amd ? define(["exports", "postcss-value-parser", "spring-easing"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.PostcssSpringEasing = {}, global.parser, global.springEasing));
})(this, function(exports2, parser, springEasing) {
  "use strict";
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
  for (let name of springEasing.EasingFunctionKeys) {
    easingFns[name.replace(/-/g, "").toLowerCase()] = springEasing.EasingFunctions[name];
    easingFns[toSnake(name)] = springEasing.EasingFunctions[name];
  }
  springEasing.registerEasingFunctions(easingFns);
  const springEasingPlugin = function(opts = {}) {
    const { easings, ...easingOpts } = opts;
    const locals = Object.assign({}, springEasing.EasingFunctions);
    if (opts.easings) {
      for (let name in Object.assign({}, opts.easings)) {
        locals[name.replace(/-/g, "").toLowerCase()] = opts.easings[name];
        locals[toSnake(name)] = opts.easings[name];
      }
    }
    springEasing.registerEasingFunctions(locals);
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
            const [easings2, duration] = springEasing.CSSSpringEasing({
              easing: contents,
              ...easingOpts
            });
            node.type = "function";
            node.value = `linear`;
            node.nodes = parser(easings2).nodes;
            decl.before(`--spring-duration: ${springEasing.toFixed(duration, 2)}ms;`);
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
  exports2.default = springEasingPlugin;
  exports2.postcss = postcss;
  exports2.springEasingPlugin = springEasingPlugin;
  exports2.toCamel = toCamel;
  exports2.toSnake = toSnake;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
//# sourceMappingURL=index.js.map
