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