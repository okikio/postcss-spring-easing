function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var openParentheses = "(".charCodeAt(0);
var closeParentheses = ")".charCodeAt(0);
var singleQuote = "'".charCodeAt(0);
var doubleQuote = '"'.charCodeAt(0);
var backslash = "\\".charCodeAt(0);
var slash = "/".charCodeAt(0);
var comma = ",".charCodeAt(0);
var colon = ":".charCodeAt(0);
var star = "*".charCodeAt(0);
var uLower = "u".charCodeAt(0);
var uUpper = "U".charCodeAt(0);
var plus = "+".charCodeAt(0);
var isUnicodeRange = /^[a-f0-9?-]+$/i;
var parse$1 = function(input) {
  var tokens = [];
  var value = input;
  var next, quote, prev, token, escape, escapePos, whitespacePos, parenthesesOpenPos;
  var pos = 0;
  var code = value.charCodeAt(pos);
  var max = value.length;
  var stack = [{ nodes: tokens }];
  var balanced = 0;
  var parent;
  var name = "";
  var before = "";
  var after = "";
  while (pos < max) {
    if (code <= 32) {
      next = pos;
      do {
        next += 1;
        code = value.charCodeAt(next);
      } while (code <= 32);
      token = value.slice(pos, next);
      prev = tokens[tokens.length - 1];
      if (code === closeParentheses && balanced) {
        after = token;
      } else if (prev && prev.type === "div") {
        prev.after = token;
        prev.sourceEndIndex += token.length;
      } else if (code === comma || code === colon || code === slash && value.charCodeAt(next + 1) !== star && (!parent || parent && parent.type === "function" && parent.value !== "calc")) {
        before = token;
      } else {
        tokens.push({
          type: "space",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      }
      pos = next;
    } else if (code === singleQuote || code === doubleQuote) {
      next = pos;
      quote = code === singleQuote ? "'" : '"';
      token = {
        type: "string",
        sourceIndex: pos,
        quote
      };
      do {
        escape = false;
        next = value.indexOf(quote, next + 1);
        if (~next) {
          escapePos = next;
          while (value.charCodeAt(escapePos - 1) === backslash) {
            escapePos -= 1;
            escape = !escape;
          }
        } else {
          value += quote;
          next = value.length - 1;
          token.unclosed = true;
        }
      } while (escape);
      token.value = value.slice(pos + 1, next);
      token.sourceEndIndex = token.unclosed ? next : next + 1;
      tokens.push(token);
      pos = next + 1;
      code = value.charCodeAt(pos);
    } else if (code === slash && value.charCodeAt(pos + 1) === star) {
      next = value.indexOf("*/", pos);
      token = {
        type: "comment",
        sourceIndex: pos,
        sourceEndIndex: next + 2
      };
      if (next === -1) {
        token.unclosed = true;
        next = value.length;
        token.sourceEndIndex = next;
      }
      token.value = value.slice(pos + 2, next);
      tokens.push(token);
      pos = next + 2;
      code = value.charCodeAt(pos);
    } else if ((code === slash || code === star) && parent && parent.type === "function" && parent.value === "calc") {
      token = value[pos];
      tokens.push({
        type: "word",
        sourceIndex: pos - before.length,
        sourceEndIndex: pos + token.length,
        value: token
      });
      pos += 1;
      code = value.charCodeAt(pos);
    } else if (code === slash || code === comma || code === colon) {
      token = value[pos];
      tokens.push({
        type: "div",
        sourceIndex: pos - before.length,
        sourceEndIndex: pos + token.length,
        value: token,
        before,
        after: ""
      });
      before = "";
      pos += 1;
      code = value.charCodeAt(pos);
    } else if (openParentheses === code) {
      next = pos;
      do {
        next += 1;
        code = value.charCodeAt(next);
      } while (code <= 32);
      parenthesesOpenPos = pos;
      token = {
        type: "function",
        sourceIndex: pos - name.length,
        value: name,
        before: value.slice(parenthesesOpenPos + 1, next)
      };
      pos = next;
      if (name === "url" && code !== singleQuote && code !== doubleQuote) {
        next -= 1;
        do {
          escape = false;
          next = value.indexOf(")", next + 1);
          if (~next) {
            escapePos = next;
            while (value.charCodeAt(escapePos - 1) === backslash) {
              escapePos -= 1;
              escape = !escape;
            }
          } else {
            value += ")";
            next = value.length - 1;
            token.unclosed = true;
          }
        } while (escape);
        whitespacePos = next;
        do {
          whitespacePos -= 1;
          code = value.charCodeAt(whitespacePos);
        } while (code <= 32);
        if (parenthesesOpenPos < whitespacePos) {
          if (pos !== whitespacePos + 1) {
            token.nodes = [
              {
                type: "word",
                sourceIndex: pos,
                sourceEndIndex: whitespacePos + 1,
                value: value.slice(pos, whitespacePos + 1)
              }
            ];
          } else {
            token.nodes = [];
          }
          if (token.unclosed && whitespacePos + 1 !== next) {
            token.after = "";
            token.nodes.push({
              type: "space",
              sourceIndex: whitespacePos + 1,
              sourceEndIndex: next,
              value: value.slice(whitespacePos + 1, next)
            });
          } else {
            token.after = value.slice(whitespacePos + 1, next);
            token.sourceEndIndex = next;
          }
        } else {
          token.after = "";
          token.nodes = [];
        }
        pos = next + 1;
        token.sourceEndIndex = token.unclosed ? next : pos;
        code = value.charCodeAt(pos);
        tokens.push(token);
      } else {
        balanced += 1;
        token.after = "";
        token.sourceEndIndex = pos + 1;
        tokens.push(token);
        stack.push(token);
        tokens = token.nodes = [];
        parent = token;
      }
      name = "";
    } else if (closeParentheses === code && balanced) {
      pos += 1;
      code = value.charCodeAt(pos);
      parent.after = after;
      parent.sourceEndIndex += after.length;
      after = "";
      balanced -= 1;
      stack[stack.length - 1].sourceEndIndex = pos;
      stack.pop();
      parent = stack[balanced];
      tokens = parent.nodes;
    } else {
      next = pos;
      do {
        if (code === backslash) {
          next += 1;
        }
        next += 1;
        code = value.charCodeAt(next);
      } while (next < max && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === star && parent && parent.type === "function" && parent.value === "calc" || code === slash && parent.type === "function" && parent.value === "calc" || code === closeParentheses && balanced));
      token = value.slice(pos, next);
      if (openParentheses === code) {
        name = token;
      } else if ((uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) && plus === token.charCodeAt(1) && isUnicodeRange.test(token.slice(2))) {
        tokens.push({
          type: "unicode-range",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      } else {
        tokens.push({
          type: "word",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      }
      pos = next;
    }
  }
  for (pos = stack.length - 1; pos; pos -= 1) {
    stack[pos].unclosed = true;
    stack[pos].sourceEndIndex = value.length;
  }
  return stack[0].nodes;
};
var walk$1 = function walk(nodes, cb, bubble) {
  var i, max, node, result;
  for (i = 0, max = nodes.length; i < max; i += 1) {
    node = nodes[i];
    if (!bubble) {
      result = cb(node, i, nodes);
    }
    if (result !== false && node.type === "function" && Array.isArray(node.nodes)) {
      walk(node.nodes, cb, bubble);
    }
    if (bubble) {
      cb(node, i, nodes);
    }
  }
};
function stringifyNode(node, custom) {
  var type = node.type;
  var value = node.value;
  var buf;
  var customResult;
  if (custom && (customResult = custom(node)) !== void 0) {
    return customResult;
  } else if (type === "word" || type === "space") {
    return value;
  } else if (type === "string") {
    buf = node.quote || "";
    return buf + value + (node.unclosed ? "" : buf);
  } else if (type === "comment") {
    return "/*" + value + (node.unclosed ? "" : "*/");
  } else if (type === "div") {
    return (node.before || "") + value + (node.after || "");
  } else if (Array.isArray(node.nodes)) {
    buf = stringify$1(node.nodes, custom);
    if (type !== "function") {
      return buf;
    }
    return value + "(" + (node.before || "") + buf + (node.after || "") + (node.unclosed ? "" : ")");
  }
  return value;
}
function stringify$1(nodes, custom) {
  var result, i;
  if (Array.isArray(nodes)) {
    result = "";
    for (i = nodes.length - 1; ~i; i -= 1) {
      result = stringifyNode(nodes[i], custom) + result;
    }
    return result;
  }
  return stringifyNode(nodes, custom);
}
var stringify_1 = stringify$1;
var unit;
var hasRequiredUnit;
function requireUnit() {
  if (hasRequiredUnit)
    return unit;
  hasRequiredUnit = 1;
  var minus = "-".charCodeAt(0);
  var plus2 = "+".charCodeAt(0);
  var dot = ".".charCodeAt(0);
  var exp = "e".charCodeAt(0);
  var EXP = "E".charCodeAt(0);
  function likeNumber(value) {
    var code = value.charCodeAt(0);
    var nextCode;
    if (code === plus2 || code === minus) {
      nextCode = value.charCodeAt(1);
      if (nextCode >= 48 && nextCode <= 57) {
        return true;
      }
      var nextNextCode = value.charCodeAt(2);
      if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
        return true;
      }
      return false;
    }
    if (code === dot) {
      nextCode = value.charCodeAt(1);
      if (nextCode >= 48 && nextCode <= 57) {
        return true;
      }
      return false;
    }
    if (code >= 48 && code <= 57) {
      return true;
    }
    return false;
  }
  unit = function(value) {
    var pos = 0;
    var length = value.length;
    var code;
    var nextCode;
    var nextNextCode;
    if (length === 0 || !likeNumber(value)) {
      return false;
    }
    code = value.charCodeAt(pos);
    if (code === plus2 || code === minus) {
      pos++;
    }
    while (pos < length) {
      code = value.charCodeAt(pos);
      if (code < 48 || code > 57) {
        break;
      }
      pos += 1;
    }
    code = value.charCodeAt(pos);
    nextCode = value.charCodeAt(pos + 1);
    if (code === dot && nextCode >= 48 && nextCode <= 57) {
      pos += 2;
      while (pos < length) {
        code = value.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
    }
    code = value.charCodeAt(pos);
    nextCode = value.charCodeAt(pos + 1);
    nextNextCode = value.charCodeAt(pos + 2);
    if ((code === exp || code === EXP) && (nextCode >= 48 && nextCode <= 57 || (nextCode === plus2 || nextCode === minus) && nextNextCode >= 48 && nextNextCode <= 57)) {
      pos += nextCode === plus2 || nextCode === minus ? 3 : 2;
      while (pos < length) {
        code = value.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
    }
    return {
      number: value.slice(0, pos),
      unit: value.slice(pos)
    };
  };
  return unit;
}
var parse = parse$1;
var walk2 = walk$1;
var stringify = stringify_1;
function ValueParser(value) {
  if (this instanceof ValueParser) {
    this.nodes = parse(value);
    return this;
  }
  return new ValueParser(value);
}
ValueParser.prototype.toString = function() {
  return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
};
ValueParser.prototype.walk = function(cb, bubble) {
  walk2(this.nodes, cb, bubble);
  return this;
};
ValueParser.unit = requireUnit();
ValueParser.walk = walk2;
ValueParser.stringify = stringify;
var lib = ValueParser;
const parser = /* @__PURE__ */ getDefaultExportFromCjs(lib);
function isNumberLike(num) {
  const value = parseFloat(num);
  return typeof value == "number" && !Number.isNaN(value);
}
function limit(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function scale(t, start, end) {
  return start + (end - start) * t;
}
function toFixed(value, decimal) {
  return Math.round(value * 10 ** decimal) / 10 ** decimal;
}
function getUnit(str) {
  const num = parseFloat(str);
  return str.toString().replace(num.toString(), "");
}
function batchInterpolateNumber(arr_t, values, decimal = 3) {
  const n = values.length - 1;
  const results = [];
  let t = 0;
  let t_index = 0;
  let len = arr_t.length;
  for (; t_index < len; t_index++) {
    t = arr_t[t_index];
    const i = limit(Math.floor(t * n), 0, n - 1);
    const start = values[i];
    const end = values[i + 1];
    const progress = (t - i / n) * n;
    results.push(toFixed(scale(progress, start, end), decimal));
  }
  return results;
}
function batchInterpolateSequence(arr_t, values) {
  const n = values.length - 1;
  const results = [];
  let t = 0;
  let t_index = 0;
  let len = arr_t.length;
  for (; t_index < len; t_index++) {
    t = limit(arr_t[t_index], 0, 1);
    const i = Math.round(t * n);
    results.push(values[i]);
  }
  return results;
}
const batchInterpolateUsingIndex = batchInterpolateSequence;
function batchInterpolateString(arr_t, values, decimal = 3) {
  let units = "";
  if (isNumberLike(values[0]))
    units = getUnit(values[0]);
  return batchInterpolateNumber(
    arr_t,
    values.map((v) => typeof v === "number" ? v : parseFloat(v)),
    decimal
  ).map((value) => value + units);
}
function batchInterpolateComplex(arr_t, values, decimal = 3) {
  let isNumber = true;
  let isLikeNumber = true;
  let i = 0;
  let v;
  const len = values.length;
  for (; i < len; i++) {
    v = values[i];
    if (isNumber)
      isNumber = typeof v === "number";
    if (isLikeNumber)
      isLikeNumber = isNumberLike(v);
  }
  if (isNumber)
    return batchInterpolateNumber(arr_t, values, decimal);
  if (isLikeNumber)
    return batchInterpolateString(arr_t, values, decimal);
  return batchInterpolateSequence(arr_t, values);
}
function BatchSpringEasing(values, options = {}, customInterpolate = batchInterpolateComplex) {
  const optionsObj = EasingOptions(options);
  const [frames, duration] = GenerateSpringFrames(optionsObj);
  return [
    customInterpolate == null ? void 0 : customInterpolate(frames, values, optionsObj.decimal),
    duration
  ];
}
function toAnimationFrames(customInterpolate) {
  return (arr_t, values, decimal) => {
    return arr_t.map((t) => customInterpolate(t, values, decimal));
  };
}
/*!
 * Based off of https://github.com/jakearchibald/linear-easing-generator
 * 
 * Changes:
 * - Added comments and docs top explain logic
 * - Switched to iterative approach for the `ramerDouglasPeucker` algorithim
 * - Renamed functions, parameters and variables to improve readability and to better match a library usecase 
 * 
 * Copyright 2023 Jake Archibald [@jakearchibald](https://github.com/jakearchibald)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function squaredSegmentDistance(point, lineStart, lineEnd) {
  let [x, y] = lineStart;
  let dx = lineEnd[0] - x;
  let dy = lineEnd[1] - y;
  if (dx !== 0 || dy !== 0) {
    let t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = lineEnd[0];
      y = lineEnd[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}
function ramerDouglasPeucker(points, tolerance) {
  const sqTolerance = tolerance * tolerance;
  if (points.length < 3)
    return points;
  let result = [points[0]];
  let stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    let [start, end] = stack.pop();
    let maxSqDist = 0;
    let index = 0;
    for (let i = start + 1; i < end; i++) {
      const sqDist = squaredSegmentDistance(points[i], points[start], points[end]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    if (maxSqDist > sqTolerance) {
      stack.push([start, index]);
      stack.push([index, end]);
    } else {
      result.push(points[end]);
    }
  }
  return result.sort((a, b) => a[0] - b[0]);
}
function getOptimizedPoints(fullPoints, simplify, round) {
  if (!fullPoints)
    return null;
  const xRounding = Math.max(round, 2);
  return ramerDouglasPeucker(fullPoints, simplify).map(
    ([x, y]) => [
      toFixed(x, xRounding),
      // Round x values
      toFixed(y, round)
      // Round y values
    ]
  );
}
/*!
 * Based off of https://github.com/jakearchibald/linear-easing-generator
 * 
 * Changes:
 * - Added comments and docs top explain logic
 * - Switched to iterative approach for the `ramerDouglasPeucker` algorithim
 * - Renamed functions, parameters and variables to improve readability and to better match a library usecase 
 * 
 * Copyright 2023 Jake Archibald [@jakearchibald](https://github.com/jakearchibald)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getLinearSyntax(points, round) {
  if (!points)
    return [];
  const xFormat = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.max(round - 2, 0)
  });
  const yFormat = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: round
  });
  const pointsValue = points;
  const valuesWithRedundantX = /* @__PURE__ */ new Set();
  const maxDelta = 1 / 10 ** round;
  for (const [i, value] of pointsValue.entries()) {
    const [x] = value;
    if (i === 0) {
      if (x === 0)
        valuesWithRedundantX.add(value);
      continue;
    }
    if (i === pointsValue.length - 1) {
      const previous2 = pointsValue[i - 1][0];
      if (x === 1 && previous2 <= 1)
        valuesWithRedundantX.add(value);
      continue;
    }
    const previous = pointsValue[i - 1][0];
    const next = pointsValue[i + 1][0];
    const averagePos = (next - previous) / 2 + previous;
    const delta = Math.abs(x - averagePos);
    if (delta < maxDelta)
      valuesWithRedundantX.add(value);
  }
  const groupedValues = [[pointsValue[0]]];
  for (const value of pointsValue.slice(1)) {
    if (value[1] === groupedValues.at(-1)[0][1]) {
      groupedValues.at(-1).push(value);
    } else {
      groupedValues.push([value]);
    }
  }
  const outputValues = groupedValues.map((group) => {
    const yValue = yFormat.format(group[0][1]);
    const regularValue = group.map((value) => {
      const [x] = value;
      let output = yValue;
      if (!valuesWithRedundantX.has(value)) {
        output += " " + xFormat.format(x * 100) + "%";
      }
      return output;
    }).join(", ");
    if (group.length === 1)
      return regularValue;
    const xVals = [group[0][0], group.at(-1)[0]];
    const positionalValues = xVals.map((x) => xFormat.format(x * 100) + "%").join(" ");
    const skipValue = `${yValue} ${positionalValues}`;
    return skipValue.length > regularValue.length ? regularValue : skipValue;
  });
  return outputValues;
}
function CSSSpringEasing(options = {}) {
  const optionsObj = EasingOptions(options);
  const [frames, duration] = GenerateSpringFrames(optionsObj);
  const quality = limit(optionsObj.quality ?? 0.85, 0, 1);
  const simplify = scale(1 - quality, 0, 0.025);
  const len = frames.length;
  const pts = frames.map((x, i) => [i / (len - 1), x]);
  const optimizedPoints = getOptimizedPoints(pts, simplify, optionsObj.decimal);
  return [
    getLinearSyntax(optimizedPoints, optionsObj.decimal).join(", "),
    duration
  ];
}
/*!
 * Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
*/
const SpringFrame = (t, [mass = 1, stiffness = 100, damping = 10, velocity = 0] = [], duration) => {
  mass = limit(mass, 1e-4, 1e3);
  stiffness = limit(stiffness, 1e-4, 1e3);
  damping = limit(damping, 1e-4, 1e3);
  velocity = limit(velocity, 1e-4, 1e3);
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;
  let position = duration ? duration * t / 1e3 : t;
  if (zeta < 1) {
    position = Math.exp(-position * zeta * w0) * (Math.cos(wd * position) + b * Math.sin(wd * position));
  } else {
    position = (1 + b * position) * Math.exp(-position * w0);
  }
  return 1 - position;
};
const EasingDurationCache = /* @__PURE__ */ new Map();
const INFINITE_LOOP_LIMIT = 1e5;
function getSpringDuration([mass, stiffness, damping, velocity] = []) {
  let params = [mass, stiffness, damping, velocity];
  let easing = `${params}`;
  if (EasingDurationCache.has(easing))
    return EasingDurationCache.get(easing);
  const step = 1 / 6;
  let time = 0;
  let numPoints = 0;
  while (++numPoints < INFINITE_LOOP_LIMIT) {
    if (Math.abs(1 - SpringFrame(time, params)) < 1e-3) {
      let restStart = time;
      let restSteps = 1;
      while (++numPoints < INFINITE_LOOP_LIMIT) {
        time += step;
        if (Math.abs(1 - SpringFrame(time, params)) >= 1e-3)
          break;
        restSteps++;
        if (restSteps === 16) {
          const duration2 = restStart * 1e3;
          EasingDurationCache.set(easing, [duration2, numPoints]);
          return [duration2, numPoints];
        }
      }
    }
    time += step;
  }
  const duration = time * 1e3;
  EasingDurationCache.set(easing, [duration, numPoints]);
  return [duration, numPoints];
}
function EaseOut(frame) {
  return (t, params = [], duration) => 1 - frame(1 - t, params, duration);
}
function EaseInOut(frame) {
  return function(t, params = [], duration) {
    return t < 0.5 ? frame(t * 2, params, duration) / 2 : 1 - frame(t * -2 + 2, params, duration) / 2;
  };
}
function EaseOutIn(frame) {
  return function(t, params = [], duration) {
    return t < 0.5 ? (1 - frame(1 - t * 2, params, duration)) / 2 : (frame(t * 2 - 1, params, duration) + 1) / 2;
  };
}
const SpringInFrame = SpringFrame;
const SpringOutFrame = EaseOut(SpringFrame);
const SpringInOutFrame = EaseInOut(SpringFrame);
const SpringOutInFrame = EaseOutIn(SpringFrame);
function interpolateNumber(t, values, decimal = 3) {
  const n = values.length - 1;
  const i = limit(Math.floor(t * n), 0, n - 1);
  const start = values[i];
  const end = values[i + 1];
  const progress = (t - i / n) * n;
  return toFixed(scale(progress, start, end), decimal);
}
function interpolateSequence(t, values) {
  const n = values.length - 1;
  t = limit(t, 0, 1);
  const i = Math.round(t * n);
  return values[i];
}
const interpolateUsingIndex = interpolateSequence;
function interpolateString(t, values, decimal = 3) {
  let units = "";
  if (isNumberLike(values[0]))
    units = getUnit(values[0]);
  return interpolateNumber(
    t,
    values.map((v) => typeof v === "number" ? v : parseFloat(v)),
    decimal
  ) + units;
}
function interpolateComplex(t, values, decimal = 3) {
  const isNumber = values.every((v) => typeof v === "number");
  if (isNumber)
    return interpolateNumber(t, values, decimal);
  const isLikeNumber = values.every((v) => isNumberLike(v));
  if (isLikeNumber)
    return interpolateString(t, values, decimal);
  return interpolateSequence(t, values);
}
let EasingFunctions = {
  spring: SpringFrame,
  "spring-in": SpringInFrame,
  "spring-out": SpringOutFrame,
  "spring-in-out": SpringInOutFrame,
  "spring-out-in": SpringOutInFrame
};
let EasingFunctionKeys = Object.keys(EasingFunctions);
function registerEasingFunction(key, fn) {
  EasingFunctions = { ...EasingFunctions, [key]: fn };
  EasingFunctionKeys = Object.keys(EasingFunctions);
}
function registerEasingFunctions(obj) {
  EasingFunctions = { ...EasingFunctions, ...obj };
  EasingFunctionKeys = Object.keys(EasingFunctions);
}
function parseEasingParameters(str) {
  const match = /(\(|\s)([^)]+)\)?/.exec(str.toString());
  return match ? match[2].split(",").map((value) => {
    let num = parseFloat(value);
    return !Number.isNaN(num) ? num : value.trim();
  }) : [];
}
function EasingOptions(options = {}) {
  const isEasing = typeof options === "string" || Array.isArray(options) && typeof options[0] === "function";
  let {
    easing = [SpringFrame, 1, 100, 10, 0],
    numPoints = 38,
    decimal = 3,
    ...rest
  } = isEasing ? { easing: options } : options;
  if (typeof easing === "string") {
    const frameFunction = EasingFunctions[easing.replace(/(\(|\s).+/, "").toLowerCase().trim()];
    const params = parseEasingParameters(easing);
    easing = [frameFunction, ...params];
  }
  return { easing, numPoints, decimal, ...rest };
}
const FramePtsCache = /* @__PURE__ */ new Map();
function GenerateSpringFrames(options = {}) {
  let {
    easing,
    numPoints
  } = EasingOptions(options);
  if (Array.isArray(easing)) {
    if (typeof easing[0] != "function") {
      throw new Error(
        "[spring-easing] A frame function is required as the first element in the easing array, e.g. [SpringFrame, ...]"
      );
    }
  } else {
    throw new Error(
      `[spring-easing] The easing needs to be in the format:  
* "spring-out(mass, stiffness, damping, velocity)" or 
* [SpringOutFrame, mass, stiffness, damping, velocity], the easing recieved is "${easing}", [spring-easing] doesn't really know what to do with that.`
    );
  }
  let [frameFunction, ...params] = easing;
  const [idealDuration, idealNumPoints = 38] = getSpringDuration(params);
  if (!numPoints)
    numPoints = idealNumPoints;
  const key = `${params},${numPoints}`;
  if (FramePtsCache.has(key)) {
    let tempObj2 = FramePtsCache.get(key);
    if (tempObj2.has(frameFunction))
      return tempObj2.get(frameFunction);
  }
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points[i] = frameFunction(i / (numPoints - 1), params, idealDuration);
  }
  const tempObj = FramePtsCache.has(key) ? FramePtsCache.get(key) : /* @__PURE__ */ new WeakMap();
  tempObj.set(frameFunction, [points, idealDuration]);
  FramePtsCache.set(key, tempObj);
  return [points, idealDuration];
}
function SpringEasing(values, options = {}, customInterpolate = interpolateComplex) {
  const optionsObj = EasingOptions(options);
  const [frames, duration] = GenerateSpringFrames(optionsObj);
  return [
    frames.map((t) => customInterpolate(t, values, optionsObj.decimal)),
    duration
  ];
}
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
  BatchSpringEasing,
  CSSSpringEasing,
  EaseInOut,
  EaseOut,
  EaseOutIn,
  EasingDurationCache,
  EasingFunctionKeys,
  EasingFunctions,
  EasingOptions,
  FramePtsCache,
  GenerateSpringFrames,
  INFINITE_LOOP_LIMIT,
  SpringEasing,
  SpringFrame,
  SpringInFrame,
  SpringInOutFrame,
  SpringOutFrame,
  SpringOutInFrame,
  batchInterpolateComplex,
  batchInterpolateNumber,
  batchInterpolateSequence,
  batchInterpolateString,
  batchInterpolateUsingIndex,
  springEasingPlugin as default,
  getLinearSyntax,
  getOptimizedPoints,
  getSpringDuration,
  getUnit,
  interpolateComplex,
  interpolateNumber,
  interpolateSequence,
  interpolateString,
  interpolateUsingIndex,
  isNumberLike,
  limit,
  parseEasingParameters,
  postcss,
  ramerDouglasPeucker,
  registerEasingFunction,
  registerEasingFunctions,
  scale,
  springEasingPlugin,
  squaredSegmentDistance,
  toAnimationFrames,
  toCamel,
  toFixed,
  toSnake
};
