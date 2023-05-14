
import { test, expect } from 'vitest';
import postcss from 'postcss';
import plugin from "../src/index";
import { limit } from 'spring-easing';

import type { PluginOpts } from "../src/index";

async function run(input: string, output: string, opts?: PluginOpts) {
  let result = await (postcss([plugin(opts)]).process(input, { from: '/test.css' }))
  expect(result.css).toEqual(output)
  expect(result.warnings().length).toEqual(0)
}

test('test readne examples', async () => {
  await run(
    `.snake { transition: all var(--spring-duration) spring-out; } .camel { transition: all var(--spring-duration) springOut; }`,
    '.snake {--spring-duration: 1333.33ms; transition: all var(--spring-duration) linear(0, -0.003 24.3%, 0.025 43.2%, 0.024, 0.004 54.1%, -0.016 56.8%, -0.132 67.6%, -0.155, -0.163, -0.149, -0.107, -0.029, 0.086, 0.239 86.5%, 0.801 94.6%, 0.943, 1); } .camel {--spring-duration: 1333.33ms; transition: all var(--spring-duration) linear(0, -0.003 24.3%, 0.025 43.2%, 0.024, 0.004 54.1%, -0.016 56.8%, -0.132 67.6%, -0.155, -0.163, -0.149, -0.107, -0.029, 0.086, 0.239 86.5%, 0.801 94.6%, 0.943, 1); }'
  )
})

test('replaces easings by name', async () => {
  await run(
    'a { transition: all 1s spring }',
    'a {--spring-duration: 1333.33ms; transition: all 1s linear(0, 0.057, 0.199 5.4%, 0.761 13.5%, 0.914, 1.029, 1.107, 1.149, 1.163, 1.155, 1.132 32.4%, 1.016 43.2%, 0.996 45.9%, 0.976, 0.975 56.8%, 1.003 75.7%, 1) }'
  )
})

test('replaces easings in custom properties', async () => {
  await run(
    ':root { --animation: springIn }',
    ':root {--spring-duration: 1333.33ms; --animation: linear(0, 0.057, 0.199 5.4%, 0.761 13.5%, 0.914, 1.029, 1.107, 1.149, 1.163, 1.155, 1.132 32.4%, 1.016 43.2%, 0.996 45.9%, 0.976, 0.975 56.8%, 1.003 75.7%, 1) }'
  )
})

test('parses regular functions', async () => {
  await run(
    'a { transition: all 1s spring(1, 100, 10, 0) }',
    'a {--spring-duration: 1333.33ms; transition: all 1s linear(0, 0.057, 0.199 5.4%, 0.761 13.5%, 0.914, 1.029, 1.107, 1.149, 1.163, 1.155, 1.132 32.4%, 1.016 43.2%, 0.996 45.9%, 0.976, 0.975 56.8%, 1.003 75.7%, 1) }'
  )
})

test('parses partial functions', async () => {
  await run(
    'a { transition: all 1s spring(1, 100) }',
    'a {--spring-duration: 1333.33ms; transition: all 1s linear(0, 0.057, 0.199 5.4%, 0.761 13.5%, 0.914, 1.029, 1.107, 1.149, 1.163, 1.155, 1.132 32.4%, 1.016 43.2%, 0.996 45.9%, 0.976, 0.975 56.8%, 1.003 75.7%, 1) }'
  )
})

test('parses snake case partial functions', async () => {
  await run(
    'a { transition: all 1s spring-in-out(1, 100) }',
    'a {--spring-duration: 1333.33ms; transition: all 1s linear(0, 0.099 2.7%, 0.457 8.1%, 0.553, 0.581, 0.566 16.2%, 0.508 21.6%, 0.492, 0.487 27%, 0.502 40.5%, 0.499 62.2%, 0.513 73%, 0.508, 0.492 78.4%, 0.434 83.8%, 0.419, 0.447, 0.543 91.9%, 0.901 97.3%, 1) }'
  )
})

test('ignores unknown names', async () => {
  await run(
    'a { transition: all 1s easeInSine1 }',
    'a { transition: all 1s easeInSine1 }'
  )
})

test('replaces easings by snake case name', async () => {
  await run(
    'a { transition: all 1s spring-in-out }',
    'a {--spring-duration: 1333.33ms; transition: all 1s linear(0, 0.099 2.7%, 0.457 8.1%, 0.553, 0.581, 0.566 16.2%, 0.508 21.6%, 0.492, 0.487 27%, 0.502 40.5%, 0.499 62.2%, 0.513 73%, 0.508, 0.492 78.4%, 0.434 83.8%, 0.419, 0.447, 0.543 91.9%, 0.901 97.3%, 1) }'
  )
})

test('replaces multiple easings including invalid easings', async () => {
  await run(
    'a { transition: spring, spring-e, springOut }',
    'a {--spring-duration: 1333.33ms;--spring-duration: 1333.33ms; transition: linear(0, 0.057, 0.199 5.4%, 0.761 13.5%, 0.914, 1.029, 1.107, 1.149, 1.163, 1.155, 1.132 32.4%, 1.016 43.2%, 0.996 45.9%, 0.976, 0.975 56.8%, 1.003 75.7%, 1), spring-e, linear(0, -0.003 24.3%, 0.025 43.2%, 0.024, 0.004 54.1%, -0.016 56.8%, -0.132 67.6%, -0.155, -0.163, -0.149, -0.107, -0.029, 0.086, 0.239 86.5%, 0.801 94.6%, 0.943, 1) }'
  )
})

test('allows to add custom easings', async () => {
  await run(
    'a { transition: BoUnce, elasTic }', 
    'a {--spring-duration: 1333.33ms;--spring-duration: 1333.33ms; transition: linear(0, 0.013, 0.015, 0.006 8.1%, 0.046 13.5%, 0.06, 0.062, 0.054, 0.034, 0.003 27%, 0.122, 0.206 37.8%, 0.232, 0.246, 0.25, 0.242, 0.224, 0.194, 0.153 56.8%, 0.039 62.2%, 0.066 64.9%, 0.448 73%, 0.646, 0.801 83.8%, 0.862 86.5%, 0.95 91.9%, 0.978, 0.994, 1), linear(0, -0.005 32.4%, 0.006 40.5%, 0.034 51.4%, 0.033 56.8%, 0.022, 0.003, -0.026 64.9%, -0.185 75.7%, -0.204, -0.195, -0.146, -0.05, 0.1 89.2%, 1) }', {
    easings: {
      Bounce: t => {
        let pow2: number, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
      },
      "elas-tic": (t, params: number[] = []) => {
        let [amplitude = 1, period = 0.5] = params;
        const a = limit(amplitude, 1, 10);
        const p = limit(period, 0.1, 2);
        if (t === 0 || t === 1) return t;
        return -a *
          Math.pow(2, 10 * (t - 1)) *
          Math.sin(
            ((t - 1 - (p / (Math.PI * 2)) * Math.asin(1 / a)) * (Math.PI * 2)) / p
          );
      }
    }
  })
})

test('allows to add change decimal value and quality', async () => {
  await run(
    'a { transition: spring, spring-in-out() }', 
    'a {--spring-duration: 1333.33ms;--spring-duration: 1333.33ms; transition: linear(0, 0.91379 16.216%, 1.14946 24.324%, 1.15484 29.73%, 0.97594 51.351%, 0.99996), linear(0, 0.4569 8.108%, 0.58149 13.514%, 0.49161 24.324%, 0.51327 72.973%, 0.41851 86.486%, 0.5431 91.892%, 1) }', {
    decimal: 5,
    quality: 0.04
  })
})