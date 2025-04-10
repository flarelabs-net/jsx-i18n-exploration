# $localize JSX preprocessor

## Scenarios

### 1. Simple message

Source code:
```jsx
<div i18n>Hello world!</div>
```

Processed:
```jsx
<div>{ $localize`hello world!` }</div>
```

Extracted message:
```json
"2219345064116959858": "hello world!",
```

```xml
<trans-unit id="2219345064116959858" datatype="html">
  <source>hello world!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: "Hello world!" })
```

Processed js:
```js
jsx("div", { children: $localize`Hello world!` })
```



### 1.1 Simple message with description

Note: the description is excluded from the message ID calculation

Source code:
```jsx
<div i18n="a friendly greeting">Hello world!</div>
```

Processed:
```jsx
<div>{ $localize`:a friendly greeting:hello world!` }</div>
```

Extracted message:
```json
"2219345064116959858": "hello world!",
```

```xml
<trans-unit id="2219345064116959858" datatype="html">
  <source>hello world!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
  <note priority="1" from="description">a friendly greeting</note>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: "Hello world!" })
```

Processed js:
```js
jsx("div", { children: $localize`:a friendly greeting:hello world!` })
```


### 1.2 Simple message with meaning

Note: the meaning usually represents the context of the message and is included in the message ID calculation

Source code:
```jsx
<div i18n="login screen|">Hello world!</div>
```

Processed:
```jsx
<div>{ $localize`:login screen|:hello world!` }</div>
```

Extracted message:
```json
"7974004330266782058": "hello world!",
```

```xml
<trans-unit id="7974004330266782058" datatype="html">
  <source>hello world!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
  <note priority="1" from="meaning">sample meaning</note>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: "Hello world!" })
```

Processed js:
```js
jsx("div", { children: $localize`:login screen|:hello world!` })
```


### 1.3 Simple message with meaning and description

Source code:
```jsx
<div i18n="login screen|a friendly greeting">Hello world!</div>
```

Processed:
```jsx
<div>{ $localize`:login screen|a friendly greeting:hello world!` }</div>
```

Extracted message:
```json
"7974004330266782058": "hello world!",
```

```xml
<trans-unit id="7974004330266782058" datatype="html">
  <source>hello world!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
  <note priority="1" from="description">a friendly greeting</note>
  <note priority="1" from="meaning">sample meaning</note>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: "Hello world!" })
```

Processed js:
```js
jsx("div", { children: $localize`:login screen|a friendly greeting:hello world!` })
```


### 1.4 Simple message with id

Source code:
```jsx
<div i18n="@@helloId">Hello world!</div>
```

Processed:
```jsx
<div>{ $localize`:@@helloId:hello world!` }</div>
```

Extracted message:
```json
"helloId": "hello world!",
```

```xml
<trans-unit id="helloId" datatype="html">
  <source>hello world!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
  <note priority="1" from="description">a friendly greeting</note>
  <note priority="1" from="meaning">sample meaning</note>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: "Hello world!" })
```

Processed js:
```js
jsx("div", { children: $localize`:@@helloId:hello world!` })
```



### 1.5 Simple message with meaning, description, and id

Source code:
```jsx
<div i18n="login screen|a friendly greeting@@helloId2">Hello world!</div>
```

Processed:
```jsx
<div>{ $localize`:login screen|a friendly greeting@@helloId2:hello world!` }</div>
```

Extracted message:
```json
"helloId2": "hello world!",
```

```xml
<trans-unit id="helloId2" datatype="html">
  <source>hello world!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
  <note priority="1" from="description">a friendly greeting</note>
  <note priority="1" from="meaning">sample meaning</note>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: "Hello world!" })
```

Processed js:
```js
jsx("div", { children: $localize`:login screen|a friendly greeting@@helloId2:hello world!` })
```



### 2. Interpolated message

Source code:
```jsx
<div i18n>Hello {name}!</div>
```

Processed:
```jsx
<div>{ $localize`hello ${name}:INTERPOLATION:!` }</div>
```

Extracted message:
```json
"2219345064116959858": "hello {$INTERPOLATION}!",
```

```xml
<trans-unit id="6101098612379306276" datatype="html">
  <source>hello <x id="INTERPOLATION" equiv-text="{{name}}"/>!</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: [
  "Hello ",
  name,
  "!"
] })
```

Processed js:
```js
jsx("div", { children: $localize`hello ${name}:INTERPOLATION:!` })
```


Processed & localized (ES) js:
```js
jsx("div", { children: `Hola ${name}!` })
```


### 2.1 Interpolated message with multiple interpolations

Source code:
```jsx
<div i18n>Hello {name}! How was your {superlative} {event}?</div>
```

Processed:
```jsx
<div>{ $localize`Hello ${name}:INTERPOLATION:! How was your ${superlative}:INTERPOLATION_2: ${event}:INTERPOLATION_3:?` }</div>
```

Extracted message:
```json
"5319345064116959858": "Hello {$INTERPOLATION}! How was your {$INTERPOLATION_2} {$INTERPOLATION_3}?",
```

```xml
<trans-unit id="6101098612379306276" datatype="html">
  <source>Hello <x id="INTERPOLATION" equiv-text="{{name}}"/>! How was your <x id="INTERPOLATION_2" equiv-text="{{superlative}}"/> <x id="INTERPOLATION_3" equiv-text="{{event}}"/>?</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: [
  "Hello ",
  name,
  "! How was your ",
  superlative,
  " ",
  event,
  "?"
] })
```

Processed js:
```js
jsx("div", { children: $localize`Hello ${name}:INTERPOLATION:! How was your ${superlative}:INTERPOLATION_2: ${event}:INTERPOLATION_3:?` })
```



### 3. Nested elements

#### 3.1 Nested html
Source code:
```jsx
<div i18n>Hello <b><i>my friend {firstName}</i></b>!</div>
```

Processed:
```jsx
<div>{ 
  $jsxify(
    $localize`Hello ${'\uFFFD#0\uFFFD'}:START_TAG_B:${'\uFFFD#1\uFFFD'}:START_TAG_I:my friend ${firstName}:INTERPOLATION: ${event}:INTERPOLATION_3:${'\uFFFD/#1\uFFFD'}:END_TAG_I:${'\uFFFD/#0\uFFFD'}:END_TAG_B:!`,
    [
      'h',
      'i',
    ]
}</div>
```

Extracted message:

Extracted message:
```json
"5319345064116959858": "Hello {PH_1}{PH_2} my friend {$INTERPOLATION}{PH_2}{PH_1}",
```

```json (ES)
"5319345064116959858": "Halo {PH_1}{PH_2} mi amiga {$INTERPOLATION}{PH_2}{PH_1}",
```


Processed:
```jsx
<div>{ $localize`Hello ${['b', {children: <i>my friend {firstName}</i>)}}]}` }</div>
```

```js
$localize`Hello ${"\uFFFD#0\uFFFD"}:START_TAG_B:${"\uFFFD#1\uFFFD"}:START_TAG_I:my friend {"\uFFFD0\uFFFD"}:INTERPOLATION:${"\uFFFD/#1\uFFFD"}:CLOSE_TAG_I:${"\uFFFD/#0\uFFFD"}:CLOSE_TAG_B:`
```

```js
=> "Hello \uFFFD#0\uFFFD\uFFFD#1\uFFFD my friend \uFFFD0\uFFFD\uFFFD/#1\uFFFD\uFFFD/#0\uFFFD"
=> "Hello {$START_TAG_B}{$START_TAG_I}my friend {$INTERPOLATION}{$CLOSE_TAG_B}{$CLOSE_TAG_I}"

=> "{$START_TAG_B}{$START_TAG_I}{$INTERPOLATION} my friend{$CLOSE_TAG_B}{$CLOSE_TAG_I} Hello "
```

#### 3.2 Nested components

Source code:
```jsx
<div i18n>We extend around greeting to you: <Greeting name={name}>some message that <b>needs</b> to be translated</Greeting> Have a great day!</div>
```

```js
function Greeting({ name }: {name: string}) {
  return <h1>Hello, {name}!</h1>;
}
```

Processed:
```jsx
<div>{ $localize`We extend around greeting to you: ${[Greeting, {name: name}]} Have a great day!` }</div>
```

```jsx
You have a pretty <Animal/>.
You have <Animal/> pretty.
```

```jsx
jsx('div', children: [
  'We extend around greeting to you: ',
  jsx(Greeting, {name: name}),
  'Have a great day!'
])
```

Extracted message:
```json
"5319345064116959858": "Hello {$INTERPOLATION}! How was your {$INTERPOLATION_2} {$INTERPOLATION_3}?",
```

```xml
<trans-unit id="6101098612379306276" datatype="html">
  <source>Hello <x id="INTERPOLATION" equiv-text="{{name}}"/>! How was your <x id="INTERPOLATION_2" equiv-text="{{superlative}}"/> <x id="INTERPOLATION_3" equiv-text="{{event}}"/>?</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/App.tsx</context>
    <context context-type="linenumber">181,182</context>
  </context-group>
</trans-unit>
```


Unprocessed js:
```js
jsx("div", { i18n: true, children: [
  "Hello ",
  name,
  "! How was your ",
  superlative,
  " ",
  event,
  "?"
] })
```

Processed js:
```js
jsx("div", { children: $localize`Hello ${name}:INTERPOLATION:! How was your ${superlative}:INTERPOLATION_2: ${event}:INTERPOLATION_3:?` })
```




-----
Angular:

```html
<p i18n>hello7 <app-horse horse-attr="fii">another string</app-horse>!</p>
```

```js
// component factory
i18n_11 = $localize`hello7 ${"\uFFFD#29\uFFFD"}:START_TAG_APP_HORSE:another string${"\uFFFD/#29\uFFFD"}:CLOSE_TAG_APP_HORSE:!`;

return [i18n_0, i18n_1, i18n_2, i18n_3, i18n_4, i18n_5, i18n_6, i18n_7, i18n_8, i18n_9, i18n_10, i18n_11, [1, "main"], ["horse-attr", "fii"]];

// create block
\u0275\u0275elementStart(27, "p");
\u0275\u0275i18nStart(28, 11);
\u0275\u0275element(29, "app-horse", 13);
\u0275\u0275i18nEnd();
\u0275\u0275elementEnd()();
```

----

```jsx
<p i18n>hello <HorseProfile breed={name}"Lipizzan">Oscar <i>von Bauch</i></HorseProfile>!</p>
```

```jsx
{
  jxsify(
    $localize`hello7 ${"\uFFFD#0\uFFFD"}:START_TAG_HORSE:another string${"\uFFFD/#0\uFFFD"}:CLOSE_TAG_HORSE:!`,
    [[HorseProfile, {'breed': 'Lipizzan'}]]
  );
}
```

```js
jsx.Fragment(children: [
  'hello7 ',
  jsx(HorseProfile, {breed: 'Lipizzan', children: [
    'Oscar',
    jsx('i', {children: 'von Bauch'}),
  ],
  '!'
)
```



```jsx
{
  jxsify(
    'hello7 \uFFFD#0\uFFFDanother string\uFFFD/#0\uFFFD!`,
    [[Horse, {'horse-attr': 'fii'}]]
  )
}
```

return value of jxify
```js
jsx.Fragment({
  children: [
    'hello7 ',
    jsx.jsx(Horse, {'horse-attr': 'fii', children: 'another string'}),
    '!'
  ]
})
```
