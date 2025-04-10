import '@angular/localize/init';
import './App.css';
import { simpleMessage } from './scenarios/simpleMessage';
import { simpleMessageWithDescription } from './scenarios/simpleMessageWithDescription';
import { simpleMessageWithMeaning } from './scenarios/simpleMessageWithMeaning.tsx';
import { simpleMessageWithMeaningAndDescription } from './scenarios/simpleMessageWithMeaningAndDescription.tsx';
import { simpleMessageWithId } from './scenarios/simpleMessageWithId';
import { simpleMessageWithMeaningDescriptionAndId } from './scenarios/simpleMessageWithMeaningDescriptionAndId.tsx';
import { fragmentMessage } from './scenarios/fragmentMessage';
import { interpolatedMessage } from './scenarios/interpolatedMessage';
import { interpolatedMultiMessage } from './scenarios/interpolatedMultiMessage';
import { multipleMessages } from './scenarios/multipleMessages.tsx';

import {$localizeJsx} from '../jsx$localize/localize';
import { $jsxify } from '../jsx$localize/jsxify';
import { useState } from 'react';
import {jsx} from 'react/jsx-runtime';


declare module 'react' {
  interface HTMLAttributes<T> {
    'i18n'?: string | boolean | undefined;
    'i18n-attr-title'?: string | boolean | undefined;
  }
}

function App() {
  // const loggedIn = true;
  // const Link = function (children: any) {
  //   return 'link:' + children;
  // };
  // const UserProfile = function () {
  //   return 'userprofile';
  // };
  // const name = 'Jadzia';

  
  // const nestedHtml = (
  //   <div i18n>
  //     Hello my <strong>friend</strong>!
  //   </div>
  // );
  // const nestedComponent = (
  //   <div i18n>
  //     Hello <Link>Jadzia</Link>!
  //   </div>
  // );
  // const nestedComponentSelfClosing = (
  //   <div i18n>
  //     Hello <UserProfile />!
  //   </div>
  // );
  // const nestedJSX = (
  //   <div i18n>Hello {loggedIn ? <UserProfile /> : 'world'}!</div>
  // );

  // const nestedI18n = (
  //   <div i18n>
  //     Hello {loggedIn ? <span i18n>friend</span> : <span i18n>stranger</span>}
  //   </div>
  // );

  // const simpleAttribute = (
  //   <img title="dog pic" i18n-attr-title src="https://placehold.co/50x50/png" />
  // );

  // const nestedAttribute = (
  //   <div i18n>
  //     This is a pic of my dog:
  //     <img
  //       title="dog pic"
  //       i18n-attr-title
  //       src="https://placehold.co/50x50/png"
  //     />
  //   </div>
  // );

  // TODO: plural/select support
  // https://v17.angular.io/guide/i18n-common-prepare#icu-expressions
  // https://unicode-org.github.io/icu/userguide/format_parse/messages/#messageformat

  function Greeting({ name, children }: {name: string, children?: any}) {
    return <i>Hello {name}!{children}</i>;
  }

  function highlight(strings: string[], ...values: unknown[]) {
    const interpolated = strings.map((string, i) => {
      return `${string}${values[i] || ''}`;
    });
    return 'cool';
  }

  const [count, setCount] = useState(0);
  function increment() {
    console.log('increment');
    setCount(count+1);
    console.log(count);
  }

  let firstName = 'George';

  return (
    <>
      {count}
      <button onClick={increment}>xxx {count}</button>
      {simpleMessage}
      {simpleMessageWithDescription}
      {simpleMessageWithMeaning}
      {simpleMessageWithMeaningAndDescription}
      {simpleMessageWithId}
      {simpleMessageWithMeaningDescriptionAndId}
      {fragmentMessage}
      
      {interpolatedMessage}
      {interpolatedMultiMessage}

      {/* {nestedHtml} */}
      {/* {nestedComponent} */}
      {/* {nestedComponentSelfClosing} */}
      {/* {nestedJSX} */}
      {/* {nestedI18n} */}
      {/* {simpleAttribute} */}
      {/* {nestedAttribute} */}

      {/* { multipleMessages }
      <div>
        before
        <Greeting name="lalala"></Greeting>
        after
      </div>

      <div>
        { <><span>this is it</span><span>this is that</span></> }
      </div>

      <div>
        {`before ${ <span>this is it</span> } after`}
      </div>

      <div>
        `before { <Greeting name="lalala"/> } after`
      </div>
 */}

 {/* <Trans id="welcome.friendly-greeting" vars={{name, time: timeoftheday}}/> */}
 {/* <div>{$localize`Hello there {name}, how is you {timeoftheday}`}</div> */}
 {/* <div i18n>Hello there <b>{name}</b>, how is you {timeoftheday}</div> */}
 {/* <div>Halo {name}, .. {timeoftheday}</div> */}
 
 
 


<div i18n>
  Hello <b><i>my friend {firstName}</i></b>!`,
</div>

<div>{ 
  $jsxify(
    $localize`Hello ${'\uFFFD#0\uFFFD'}:START_TAG_B:${'\uFFFD#1\uFFFD'}:START_TAG_I:my friend ${firstName}:INTERPOLATION:${'\uFFFD/#1\uFFFD'}:END_TAG_I:${'\uFFFD/#0\uFFFD'}:END_TAG_B:!`,
    [
      <b></b>,
      <i></i>,
    ]
  )
}</div>


<div>{ 
  $jsxify(
    $localize`Hello ${'\uFFFD#0\uFFFD'}:START_TAG_B:${'\uFFFD#1\uFFFD'}:START_TAG_I:my friend ${'\uFFFD#2\uFFFD'}:START_TAG_U:${firstName}:INTERPOLATION:${'\uFFFD/#2\uFFFD'}:END_TAG_U:${'\uFFFD/#1\uFFFD'}:END_TAG_I:${'\uFFFD/#0\uFFFD'}:END_TAG_B:!`,
    [
      <b></b>,
      <i></i>,
      <u></u>,
    ]
  )
}</div>

<div i18n>
  initial text
  <u>
    <Greeting name="lalala">extra</Greeting>
  </u>
  suffix text
</div>

<div>{ 
  $jsxify(
    $localize`initial text ${'\uFFFD#0\uFFFD'}:START_TAG_U:${'\uFFFD#1\uFFFD'}:START_COMPONENT_GREETING:extra${'\uFFFD/#1\uFFFD'}:END_COMPONENT_GREETING:${'\uFFFD/#0\uFFFD'}:END_TAG_U: suffix text`,
    [
      <u></u>,
      <Greeting name="lalala"></Greeting>
    ]
  )
}</div>


<div i18n>
  before|
  <u>
    <Greeting name="self-closing"/>
  </u>
  |after
</div>

<div>{ 
  $jsxify(
    $localize`before|${'\uFFFD#0\uFFFD'}:START_TAG_U:${'\uFFFD#1/\uFFFD'}:COMPONENT_GREETING:${'\uFFFD/#0\uFFFD'}:END_TAG_U:|after`,
    [
      <u></u>,
      <Greeting name="self-closing"></Greeting>
    ]
  )
}</div>

<div i18n>
  before|
  <u>
    first: <Greeting name="swapped"/>
    second: <Greeting name="double"/>
  </u>
  |after
</div>

<div>{ 
  $jsxify(
    $localize`initial text ${'\uFFFD#0\uFFFD'}:START_TAG_U:first:${'\uFFFD#2/\uFFFD'}:COMPONENT_GREETING_1:second: ${'\uFFFD#1/\uFFFD'}:COMPONENT_GREETING:${'\uFFFD/#0\uFFFD'}:END_TAG_U: suffix text`,
    [
      <u></u>,
      <Greeting name="double"/>,
      <Greeting name="swapped"/>
    ]
  )
}</div>


    </>
  );
}

export default App;
