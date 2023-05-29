import parser from 'postcss-value-parser'
import { EasingFunctions, EasingFunctionKeys, CSSSpringEasing, registerEasingFunctions, toFixed } from 'spring-easing'

import type { FunctionNode } from 'postcss-value-parser'
import type { TypeCSSEasingOptions, TypeFrameFunction } from 'spring-easing'
import type { PluginCreator } from 'postcss'

export function toSnake(str: string) {
  return str[0] + str.slice(1).replace(/[A-Z]/g, letter => {
    return '-' + letter.toLowerCase()
  })
}

export function toCamel(str: string) {
  return str.replace(/-[a-z]/g, letter => {
    return letter[1].toUpperCase()
  })
}

const easingFns: Record<string, TypeFrameFunction> = {}
for (let name of EasingFunctionKeys) {
  easingFns[name.replace(/-/g, "").toLowerCase()] = EasingFunctions[name]
  easingFns[toSnake(name)] = EasingFunctions[name]
}

registerEasingFunctions(easingFns);

export type PluginOpts = Omit<TypeCSSEasingOptions, "easing"> & { easings?: Record<string, TypeFrameFunction> };
export const springEasingPlugin: PluginCreator<PluginOpts> = function (opts = {}) {
  const { easings, ...easingOpts } = opts;
  const locals: Record<string, TypeFrameFunction> = Object.assign({}, EasingFunctions)
  if (opts.easings) {
    for (let name in Object.assign({}, opts.easings)) {
      locals[name.replace(/-/g, "").toLowerCase()] = opts.easings[name]
      locals[toSnake(name)] = opts.easings[name]
    }
  }

  registerEasingFunctions(locals);

  const localKeys = Array.from(new Set(Object.keys(locals)))
  const localKeysStr = localKeys.join("|").trim();

  return {
    postcssPlugin: 'postcss-spring-easing',
    Declaration(decl) {
      if (!new RegExp(localKeysStr, 'i').test(decl.value)) return
      let root = parser(decl.value)
      let changed = false
      root.nodes = root.nodes.map(node => {
        let value = node.value.trim()
        const isFunction = node.type === 'function';
        const isWord = node.type === 'word';
        if ((isWord || isFunction) && value.length > 0 && new RegExp(`^(${localKeysStr})$`, 'i').test(value)) {
          changed = true
          const contents = isFunction ? parser.stringify(node) : value;
          const [easings, duration] = CSSSpringEasing({
            easing: contents,
            ...easingOpts
          });
          node.type = "function";
          node.value = `linear`;
          (node as FunctionNode).nodes = parser(easings).nodes;
          decl.before(`--spring-duration: ${toFixed(duration, 2)}ms;`)
        }
        return node
      })
      if (changed) {
        decl.value = root.toString()
      }
    }
  }
}
export const postcss = true;
springEasingPlugin.postcss = postcss;
export default springEasingPlugin;