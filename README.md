# postcss-spring-easing

[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=postcss-spring-easing&bundle "Check the total bundle size of postcss-spring-easing with whichever animation library you choose.")

<!-- ![](https://deno.bundlejs.com/badge?q=postcss-spring-easing) -->

[NPM](https://www.npmjs.com/package/postcss-spring-easing) <span style="padding-inline: 1rem">|</span> [GitHub](https://github.com/okikio/postcss-spring-easing#readme) <span style="padding-inline: 1rem">|</span>  [Licence](./LICENSE)

PostCSS plugin to replace `spring()` functions with a `linear()` easing function. Inspired by [postcss-easings](https://github.com/postcss/postcss-easings).

```css
.snake {
  transition: all var(--spring-duration) spring-out;
}
.camel {
  transition: all var(--spring-duration) springOut;
}
```

```css
.snake {
  --spring-duration: 1333.33ms; 
  transition: all var(--spring-duration) linear(0, -0.003 24.3%, 0.025 43.2%, 0.024, 0.004 54.1%, -0.016 56.8%, -0.132 67.6%, -0.155, -0.163, -0.149, -0.107, -0.029, 0.086, 0.239 86.5%, 0.801 94.6%, 0.943, 1); 
} 
.camel {
  --spring-duration: 1333.33ms; 
  transition: all var(--spring-duration) linear(0, -0.003 24.3%, 0.025 43.2%, 0.024, 0.004 54.1%, -0.016 56.8%, -0.132 67.6%, -0.155, -0.163, -0.149, -0.107, -0.029, 0.086, 0.239 86.5%, 0.801 94.6%, 0.943, 1); 
}
```

> _**Note**: all the easings [spring-easing](https://github.com/okikio/spring-easing) supports `postcss-spring-easing` supports as well._

<!-- > You can also read the [blog post](https://blog.okikio.dev/postcss-spring-easing), created for it's launch. -->

You can create animation's like this with `postcss-spring-easing`,

<img src="media/assets/spring-easing-demo-video.gif" width="1920" loading="lazy" alt="A demo of the various postcss-spring-easings available" align="center" style="border-radius: 1rem; aspect-ratio: auto 1920 / 899;" />


<!-- https://github.com/okikio/postcss-spring-easing/assets/17222836/3813945f-b301-4399-8383-bbab227c3f68

<video controls autoplay align="center" style="border-radius: 1rem; aspect-ratio: auto 1920 / 899;">
  <source src="media/assets/postcss-spring-easing-demo-video.mp4" type="video/mp4">
</video> -->

> _Check out the spring easing variants on [Codepen](https://codepen.io/okikio/pen/MWEMEgJ)._

## Installation

```bash
npm install postcss-spring-easing
```

<details>
  <summary>Others</summary>

```bash
yarn add postcss-spring-easing
```

or

```bash
pnpm install postcss-spring-easing
```

</details>


## Usage

```ts
import { springEasingPlugin } from "postcss-spring-easing";
// or
import springEasingPlugin from "postcss-spring-easing";
```

You can also use it directly through a script tag:

```html
<script src="https://unpkg.com/postcss-spring-easing" type="module"></script>
<script type="module">
  // You can then use it like this
  const { springEasingPlugin } = window.PostcssSpringEasing;
</script>
```

You can also use it via a CDN, e.g.

```ts
import { springEasingPlugin } from "https://esm.run/postcss-spring-easing";
// or
import { springEasingPlugin } from "https://esm.sh/postcss-spring-easing";
// or
import { springEasingPlugin } from "https://unpkg.com/postcss-spring-easing";
// or
import { springEasingPlugin } from "https://cdn.skypack.dev/postcss-spring-easing";
// or
import { springEasingPlugin } from "https://deno.bundlejs.com/file?q=postcss-spring-easing";
// or any number of other CDN's
```

## Setup

Check your project for an existing PostCSS config: `postcss.config.js` in the project root,`"postcss"` section in the `package.json` or `postcss` in your bundle config.

Add the plugin to plugins list:
```diff
module.exports = {
  plugins: [
+   require('postcss-spring-easing').default,
    require('autoprefixer')
  ]
}
```

Or

```ts
// dependencies
var fs = require("fs")
var postcss = require("postcss")
var { springEasingPlugin } = require("postcss-spring-easing")

// css to be processed
var css = fs.readFileSync("input.css", "utf8")

// process css
var output = postcss()
  .use(springEasingPlugin())
  .process(css)
  .css
```
Checkout [tests](./tests/) for more examples.

## Showcase

A couple sites/projects that use `postcss-spring-easing`:

- Your site/project here...

## Options

`postcss-spring-easing` has 4 options they are 
* `easing` (all the easings from [EasingFunctions](https://spring-easing.okikio.dev/types/typecsseasingoptions) are supported), 
* `easings` (list of extra custom easings to support),
* `decimal` (the number of decimal places of the resulting values), and
* `quality` (how detailed/smooth the spring easing should be)

| Properties  | Default Value           |
| ----------- | ----------------------- |
| `easing`    | `spring(1, 100, 10, 0)` |
| `easings`   | `{}`                    |
| `decimal`   | `3`                     |
| `quality`   | `0.85`                  |

### `easing`

By default, spring easings are supported in the form,

| constant | accelerate         | decelerate | accelerate-decelerate | decelerate-accelerate |
| :------- | :----------------- | :--------- | :-------------------- | :-------------------- |
|          | spring / spring-in | spring-out | spring-in-out         | spring-out-in         |

All **Spring** easing's can be configured using theses parameters,

`spring-*(mass, stiffness, damping, velocity)`

Each parameter comes with these defaults

| Parameter | Default Value |
| --------- | ------------- |
| mass      | `1`           |
| stiffness | `100`         |
| damping   | `10`          |
| velocity  | `0`           |

To understand what each of the parameters of `SpringEasing` mean and how they work I suggest looking through the [SpringEasing API Documentation](https://spring-easing.okikio.dev/functions/springeasing)

For a full understanding of what is happening in the `SpringEasing` library, pleace check out its [API site](https://spring-easing.okikio.dev/modules) for detailed API documentation.


```css
a {
  transition: all var(--spring-duration) spring(1, 100, 10, 0);
}
```

### `easings`

Allow to set custom easings:

```js
    require('postcss-spring-easing').default({
      easings: { 
        bounceOut: t => {
          let pow2, b = 4;
          while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
          return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
        },
      }
    })
```

The plugin will convert custom easing name between camelCase and snake-case.
So the example above would work for `bounce-out` and `bounceOut` easings.


## Browser Support

| Chrome | Edge | Firefox | Safari | IE  |
| ------ | ---- | ------- | ------ | --- |
| 113+   | 113+ | 112+    | -      | -   |

`postcss-spring-easing` is meant for browsers which have support for the `linear()` easing function, which as of right now is `Chrome & Edge 113` + `Firefox 112`, `Safari` doesn't support it yet.

## Contributing

I encourage you to use [pnpm](https://pnpm.io/configuring) to contribute to this repo, but you can also use [yarn](https://classic.yarnpkg.com/lang/en/) or [npm](https://npmjs.com) if you prefer.

Install all necessary packages

```bash
npm install
```

Then run tests

```bash
npm test
```

Build project

```bash
npm run build
```

> _**Note**: this project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard for commits, so, please format your commits using the rules it sets out._

## Licence

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT). 

The `CSSSpringEasing`, `getOptimizedPoints` and `getLinearSyntax` functions from `spring-easing` which are used in `postcss-spring-easing` are based of the work done by [Jake Archibald](https://github.com/jakearchibald/linear-easing-generator) in his [Linear Easing Generator](https://linear-easing-generator.netlify.app/) 
and are thus licensed under the [Apache License 2.0](https://github.com/jakearchibald/linear-easing-generator/blob/main/LICENSE).
