import '@angular/localize/init';
import './App.css';

import { useState } from 'react';


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

      {/* {nestedJSX} */}
      {/* {nestedI18n} */}
      {/* {simpleAttribute} */}
      {/* {nestedAttribute} */}

      {/*
        <h1>Hello there!</h1>
        <Trans id="welcome.friendly-greeting" />

      <h1>Hello <User name={name}/>, <b>good</b> {timeoftheday}</h1>
      <h1><Trans id="welcome.friendly-greeting" vars={{name, time: timeoftheday}} Components={[User]} componentProps={[{name: name}]}></User>/]}/></h1>
      
      <div>{$localize`Hello there ${name}, how is you ${timeoftheday}`}</div>
      <div i18n>Hello there <b>{name}</b>, how is you {timeoftheday}</div>
        
      */}

      <div i18n>
        Hello <b><i>my friend {firstName}</i></b>!
      </div>

      <div i18n>
        *prefix*
        <u>
          <Greeting name="lalala">extra</Greeting>
        </u>
        *suffix*
      </div>


      <div i18n>
        *prefix*
        <u>
          <Greeting name="self-closing"/>
        </u>
        *suffix*
      </div>

      <div i18n>
        *prefix*
        <u>
          first: <Greeting name="swapped"/>
          second: <Greeting name="double"/>
        </u>
        *suffix*
      </div>

    </>
  );
}

export default App;
