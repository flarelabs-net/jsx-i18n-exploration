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
  // const name = 'Jadzia';

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

  const loggedIn = Math.random() > 0.5;
  const UserProfile = function () {
    return <>userprofile</>;
  };

  return (
    <>
      <div i18n>
        Hello world!
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" />
      */}


      <div i18n>
        Hello {firstName}!
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" vars={{name: firstName}} />
      */}


      <div i18n>
        Click to increment: <button onClick={increment}>count={count}</button>
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" ???? />
      */}


      <div i18n>
        Hello <b><i>my friend {firstName}</i></b>!
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" vars={{name: firstName}} />
      */}


      <div i18n>
        *prefix*
        <u>
          <Greeting name={firstName}>extra</Greeting>
        </u>
        *suffix*
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" Components={[Greeting]} componentProps={[{name: firstName}]} />
      */}


      <div i18n>
        *prefix*
        <u>
          <Greeting name="self-closing"/>
        </u>
        *suffix*
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" Components={[Greeting]} componentProps={[{name: "self-closing"}]} />
      */}

      <div i18n>
        *prefix*
        <u>
          first: <Greeting name="swapped"/>
          second: <Greeting name="double"/>
        </u>
        *suffix*
      </div>

      {/*
      <Trans id="welcome.friendly-greeting" Components={[Greeting, Greeting]} componentProps={[{name: "swapped"}, {name: "double"}]} />
      */}

      <div i18n>Hello {loggedIn ? <UserProfile /> : 'world'}!</div>

      <div i18n>
        Hello {loggedIn ? <span i18n>friend</span> : <span i18n>stranger</span>}
      </div>

    </>
  );
}

export default App;
