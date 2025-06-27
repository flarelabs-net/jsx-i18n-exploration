# JSX i18n exploration

Goal: Could internationalization of JSX/TSX templates be as natural as writing JSX itself?

This project attempts to achieve that goal via a JSX pre-processor that can run as a Vite plugin and produces `$localize` calls, in a way that mimics how [Angular's i18n works](https://angular.dev/guide/i18n/prepare).

## Getting started

1. Checkout this repo
2. `pnpm install`

Dev mode flow:
`pnpm dev`

Prod mode flow:
`pnpm build-and-preview`


## Authoring i18n messages

To create a internationalizable message block just add `i18n` attribute to any JSX element in the template.

For example instead of

```tsx
<div>Hello world!</div>
```

write

```tsx
<i18n><div>Hello world!</div></i18n>
```
That's it!

Why is this cool?

Mainly because you can now write JSX templates with string interpolation or even nested html and components and the preprocessor will take care of making the JSX internationalizable.

See [src/App.tsx](./src/App.tsx#L57-L165) for many usage examples.

Even more examples can be found in the test suite: [./jsx$localize/src/transform.spec.ts](./jsx$localize/src/transform.spec.ts)

# Message extraction & app localization

To extract the "Hello world!" string, run `pnpm extract-messages`.
The message will be stored in [`messages.json`](./messages.json) file along with its fingerprint.

To translate a newly added message, append the translated message using the same fingerprint key to [`messages-sk.json`](./messages-sk.json) and return `pnpm build-and-preview`.


## How does it work?

- Relies on Angular's $localize for all the heavy lifting of message extraction, and [runtime as well as build time localization](https://qwik.dev/docs/integrations/i18n/#runtime-vs-compile-time-translation).
- Uses `recast` and `babel-ts` parser to parse and mutate JSX/TSX AST while preserving source maps.
- Turns all message blocks with interpolation or nested components into an intermediate format which survives translation and message merging, and supports component reordering. This is the format that is extracted by $localized and translated.
- This intermediate format is then turned back to JSX at runtime using a runtime specific [`$jsxify` function](./jsx$localize/react/jsxify.ts).
- All of this is packaged as Vite plugin so that it can be dropped into any project.


## TODOs

- [x] add support for internationalization of html attributes, e.g. `<img title="a cute puppy pic" i18n-attr-title src="...">`
- [x] consider creating `<i18n>` component to enable usage without an existing element wrapper, e.g. `<i18n>Hello world!</i18n>` ([see disabled tests](https://github.com/flarelabs-net/jsx-i18n-exploration/blob/0ee307d4e0d66c5862779e08503e99dd3b52a627/jsx%24localize/transform.spec.ts#L51-L76) for more info)
- [ ] add tests for the `jsxify` function
- [ ] automate e2e tests
- [ ] publish as an npm package
- [ ] usage docs
- [ ] add support for pluralization via ICUs
- [ ] add support for Qwik
