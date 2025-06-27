import '@angular/localize/init';
import './App.css';
import { useState } from 'react';

const helloTopLevelJSX = <i18n>Hello world!</i18n>;
const helloTopLevelString =  $localize`Hello world!`;


function App() {
  

  // TODO: plural/select support
  // https://v17.angular.io/guide/i18n-common-prepare#icu-expressions
  // https://unicode-org.github.io/icu/userguide/format_parse/messages/#messageformat

  function Greeting({ name, children }: {name: string, children?: any}) {
    return <i>Hello {name}!{children}</i>;
  }

  const [count, setCount] = useState(0);
  function increment() {
    console.log('increment');
    setCount(count+1);
    console.log(count);
  }

  const firstName = 'George';

  const loggedIn = Math.random() > 0.5;
  const UserProfile = function () {
    return <>userprofile</>;
  };

  return (
    <>
      <i18n>
        Hello world!
      </i18n>

      <hr/>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" />
      */}


      <div>
        <i18n>
          Hello div-wrapped moon!
        </i18n>
      </div>

      {/* compare to status quo:
      <div><Trans id="welcome.friendly-moon-greeting" /></div>
      */}

      <hr/>

      <i18n>
        Hello {firstName}!
      </i18n>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" vars={{name: firstName}} />
      */}

      <hr/>

      <i18n>
        Click to increment: <button onClick={increment}>count={count}</button>
      </i18n>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" ???? />
      */}

      <hr/>

      <i18n>
        Hello <b><i>my friend {firstName}</i></b>!
      </i18n>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" vars={{name: firstName}} />
      */}


      <i18n>
        *prefix*
        <u>
          <Greeting name={firstName}>extra</Greeting>
        </u>
        *suffix*
      </i18n>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" Components={[Greeting]} componentProps={[{name: firstName}]} />
      */}

      <hr/>

      <i18n>
        *prefix*
        <u>
          <Greeting name="self-closing"/>
        </u>
        *suffix*
      </i18n>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" Components={[Greeting]} componentProps={[{name: "swapped"}]} />
      */}

      <hr/>

      <i18n>
        *prefix*
        <u>
          first: <Greeting name="swapped"/>
          second: <Greeting name="double"/>
        </u>
        *suffix*
      </i18n>

      {/* compare to status quo:
      <Trans id="welcome.friendly-greeting" Components={[Greeting, Greeting]} componentProps={[{name: "swapped"}, {name: "double"}]} />
      */}

      <hr/>

      <i18n>Hello {loggedIn ? <UserProfile /> : 'world'}!</i18n>

      <hr/>

      <i18n>
        Hello {loggedIn ? <span><i18n>friend</i18n></span> : <span><i18n>stranger</i18n></span>}
      </i18n>

      <hr/>
      
      {helloTopLevelJSX}

      <hr/>
      {helloTopLevelString}
    </>
  );
}

export default App;
