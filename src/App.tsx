import './App.css';
import { simpleMessage } from './scenarios/simpleMessage';
import { simpleMessageWithDescription } from './scenarios/simpleMessageWithDescription';
import { simpleMessageWithMeaning } from './scenarios/simpleMessageWithMeaning.tsx';
import { simpleMessageWithMeaningAndDescription } from './scenarios/simpleMessageWithMeanigAndDescription.tsx';
import { simpleMessageWithId } from './scenarios/simpleMessageWithId';
import { simpleMessageWithMeaningDescriptionAndId } from './scenarios/simpleMessageWithMeaningDescriptionAndId.tsx';
import { fragmentMessage } from './scenarios/fragmentMessage';
import { interpolatedMessage } from './scenarios/interpolatedMessage';
import { interpolatedMultiMessage } from './scenarios/interpolatedMultiMessage';
import { multipleMessages } from './scenarios/multipleMessages.tsx';

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

  return (
    <>
      {simpleMessage}
      {simpleMessageWithDescription}
      {simpleMessageWithMeaning}
      {simpleMessageWithMeaningAndDescription}
      {simpleMessageWithId}
      {simpleMessageWithMeaningDescriptionAndId}
      {/* {fragmentMessage} */}
      
      {interpolatedMessage}
      {interpolatedMultiMessage}

      {/* {nestedHtml} */}
      {/* {nestedComponent} */}
      {/* {nestedComponentSelfClosing} */}
      {/* {nestedJSX} */}
      {/* {nestedI18n} */}
      {/* {simpleAttribute} */}
      {/* {nestedAttribute} */}

      {/* { multipleMessages } */}
    </>
  );
}

export default App;
