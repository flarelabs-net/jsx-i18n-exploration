import { describe, expect, it } from 'vitest';
import { transform } from './transform';


describe('transform', () => {
  describe('simple JSX element translation', () => {
    
    it('should transform a simple JSX element', () => {
      const {code} = transform(`
        <i18n>Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`Hello world!\`)}</>
      `);
    });

    it('should transform a simple JSX element with a description', () => {
      const {code} = transform(`
        <i18n description="a friendly greeting">Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`:a friendly greeting:Hello world!\`)}</>
      `);
    });

    it('should transform a simple JSX element with an id', () => {
      const {code} = transform(`
        <i18n id="helloId">Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`:@@helloId:Hello world!\`)}</>
      `);
    });

    it('should transform a simple JSX element with meaning', () => {
      const {code} = transform(`
        <i18n meaning="login screen">Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`:login screen|:Hello world!\`)}</>
      `);
    });

    it('should transform a simple JSX element with meaning and description', () => {
      const {code} = transform(`
        <i18n meaning="login screen" description="a friendly greeting">Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`:login screen|a friendly greeting:Hello world!\`)}</>
      `);
    });

    it('should transform a simple JSX element with a description and an id', () => {
      const {code} = transform(`
        <i18n description="a friendly greeting" id="helloId">Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`:a friendly greeting@@helloId:Hello world!\`)}</>
      `);
    });

    it('should transform a simple JSX element with a description, meaning, and id', () => {
      const {code} = transform(`
        <i18n meaning="login screen" description="a friendly greeting" id="helloId2">Hello world!</i18n>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <>{$jsxify(() => $localize\`:login screen|a friendly greeting@@helloId2:Hello world!\`)}</>
      `);
    });
  });

  describe('JSX fragments', () => {
    it('should transform messages wrapped in JSX fragments', () => {
      const {code} = transform(`
        <><i18n>Hello world!</i18n></>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <><>{$jsxify(() => $localize\`Hello world!\`)}</></>
      `);
    });
  });

  describe('multiple messages', () => {
    it('should transform multiple messages in a single file', () => {
      const {code} = transform(`
        export const multipleMessages = {
          message1: <i18n>Hello world!</i18n>,
          message2: <i18n description="a friendly bye bye">Have a nice day!</i18n>,
          fragment: (<><span></span><i18n>Hello world!</i18n></>),
        }`, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const multipleMessages = {
          message1: <>{$jsxify(() => $localize\`Hello world!\`)}</>,
          message2: <>{$jsxify(() => $localize\`:a friendly bye bye:Have a nice day!\`)}</>,
          fragment: (<><span></span><>{$jsxify(() => $localize\`Hello world!\`)}</></>),
        }`);
    });
  });

  describe('interpolation', () => {
    it('should transform messages with simple interpolation', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const interpolatedMessage = <i18n>Hello {name}!</i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const name = 'Jadzia';

        export const interpolatedMessage = <>{$jsxify(() => $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:!\`, [name])}</>;
        `);
    });

    it('should transform messages with an empty expression', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const interpolatedMessage = <i18n>Hello{}!</i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const name = 'Jadzia';

        export const interpolatedMessage = <>{$jsxify(() => $localize\`Hello!\`)}</>;
        `);
    });

    it('should transform messages with complex interpolation', () => {
      const {code} = transform(`
        const greeting = 'Hello';
        const name = 'Jadzia';
        const superlative = 'amazing';
        const event = 'birthday party';
        const no = 'no';
        const spaceInBetween = 'spaceInBetween';

        export const interpolatedMultiMessage =  <i18n>{greeting} {name}! How was your {superlative} {event}? {no}{spaceInBetween}?</i18n>
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const greeting = 'Hello';
        const name = 'Jadzia';
        const superlative = 'amazing';
        const event = 'birthday party';
        const no = 'no';
        const spaceInBetween = 'spaceInBetween';

        export const interpolatedMultiMessage =  <>{$jsxify(
                        () => $localize\`\${"�#0/�"}:INTERPOLATION#0: \${"�#1/�"}:INTERPOLATION#1:! How was your \${"�#2/�"}:INTERPOLATION#2: \${"�#3/�"}:INTERPOLATION#3:? \${"�#4/�"}:INTERPOLATION#4:\${"�#5/�"}:INTERPOLATION#5:?\`,
                        [greeting, name, superlative, event, no, spaceInBetween]
                )}</>
        `);
    });

    it('should transform messages with interpolation that returns a JSX component', () => {
      const {code} = transform(`
        const Greeting = () => <span>Hello</span>;
        const name = <span>Jadzia</span>;
        const greetingEmoji = '👋';
        
        export const interpolatedComponentMessage =  <i18n>{ <Greeting/> } {name}! { greetingEmoji }</i18n>
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const Greeting = () => <span>Hello</span>;
        const name = <span>Jadzia</span>;
        const greetingEmoji = '👋';

        export const interpolatedComponentMessage =  <>{$jsxify(
                        () => $localize\`\${"�#0/�"}:INTERPOLATION#0: \${"�#1/�"}:INTERPOLATION#1:! \${"�#2/�"}:INTERPOLATION#2:\`,
                        [<Greeting/>, name, greetingEmoji]
                )}</>
        `);
    });
  });

  describe('nested html and components', () => {
    it('should transform messages with nested html', () => {
      const {code} = transform(`
        export const nestedHtml = <i18n>Hello <hr/></i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const nestedHtml = <>{$jsxify(() => $localize\`Hello \${"�#0/�"}:TAG_hr#0:\`, [<hr/>])}</>;
        `);
    });

    it('should transform messages with nested html', () => {
      const {code} = transform(`
        export const nestedHtml = <i18n>Hello <span>world!</span></i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const nestedHtml = <>{$jsxify(
                        () => $localize\`Hello \${"�#0�"}:TAG_START_span#0:world!\${"�/#0�"}:TAG_END_span#0:\`,
                        [<span></span>]
                )}</>;
        `);
    });

    it('should transform messages with nested html and interpolation', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const nestedHtml = <i18n>Hello <b><i>my friend {firstName}</i></b>!</i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const name = 'Jadzia';

        export const nestedHtml = <>{$jsxify(
                        () => $localize\`Hello \${"�#0�"}:TAG_START_b#0:\${"�#1�"}:TAG_START_i#1:my friend \${"�#2/�"}:INTERPOLATION#2:\${"�/#1�"}:TAG_END_i#1:\${"�/#0�"}:TAG_END_b#0:!\`,
                        [<b></b>, <i></i>, firstName]
                )}</>;
        `);
    });

    it('should transform messages with nested self-closing components', () => {
      const {code} = transform(`
        const Greeting = () => <span>Hello!</span>;
        export const nestedHtml = <i18n>Hello <Greeting/></i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const Greeting = () => <span>Hello!</span>;
        export const nestedHtml = <>{$jsxify(() => $localize\`Hello \${"�#0/�"}:TAG_Greeting#0:\`, [<Greeting/>])}</>;
        `);
    });

    it('should transform messages with nested components', () => {
      const {code} = transform(`
        export const nestedHtml = <i18n>Hello <Greeting kind="wild">{name}</Greeting></i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const nestedHtml = <>{$jsxify(
                        () => $localize\`Hello \${"�#0�"}:TAG_START_Greeting#0:\${"�#1/�"}:INTERPOLATION#1:\${"�/#0�"}:TAG_END_Greeting#0:\`,
                        [<Greeting kind="wild"></Greeting>, name]
                )}</>;
        `);
    });
  });


  describe('nested JSX', () => {

    it('should transform messages with nested JSX', () => {
      const {code} = transform(`
          const loggedIn = true;
          const UserProfile = function () {
            return 'userprofile';
          };
          
          const nestedJSX = (
            <i18n>Hello {loggedIn ? <UserProfile /> : 'world'}!</i18n>
          );
        `, 'test');

      expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          const loggedIn = true;
          const UserProfile = function () {
            return 'userprofile';
          };

          const nestedJSX = (
            <>{$jsxify(
                () => $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:!\`,
                [loggedIn ? <UserProfile /> : 'world']
              )}</>
          );
        `);
    });

  });

  describe('nested i18n', () => {

    it('should transform messages with nested i18n', () => {
      const {code} = transform(`
          const loggedIn = true;
          
          const nestedJSX = (
            <i18n>
              Hello {loggedIn ? <i18n>friend</i18n> : <i18n>stranger</i18n>}
            </i18n>
          );
        `, 'test');

      expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          const loggedIn = true;

          const nestedJSX = (
            <>{$jsxify(() => $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:\`, [
                loggedIn ? <>{$jsxify(() => $localize\`friend\`)}</> : <>{$jsxify(() => $localize\`stranger\`)}</>
              ])}</>
          );
        `);
    });

  });


  describe('whitespace handling', () => {
    /*
      Basic Whitespace Rules in JSX
      1. Adjacent whitespace characters are collapsed into a single space
         - Multiple spaces, tabs, and newlines are treated as a single space
      2. Leading and trailing whitespace in a line is removed
         - Whitespace at the beginning and end of JSX lines is ignored
      3. Line breaks between elements are ignored
         - But line breaks within text are preserved as spaces
    */

    it('should collapse whitespace within a text to just one space', () => {
      const {code} = transform(`
        export const whitespace = <i18n>Hello    world!</i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <>{$jsxify(() => $localize\`Hello world!\`)}</>;
        `);
    });

    it('should collapse leading and trailing whitespace of a text enclosed by a tag on the same line', () => {
      const {code} = transform(`
        export const whitespace = <i18n>   Hello world!   </i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <>{$jsxify(() => $localize\` Hello world! \`)}</>;
        `);
    });

    it('should remove leading and trailing whitespace of a text that is on a new line', () => {
      const {code} = transform(`
        export const whitespace = <i18n>
                                    Hello world!
                                  </i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <>{$jsxify(() => $localize\`Hello world!\`)}</>;
        `);
    });

    it('should convert a newline within a text to a space', () => {
      const {code} = transform(`
        export const whitespace = <i18n>
                                    Hello
                                    world!
                                  </i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <>{$jsxify(() => $localize\`Hello world!\`)}</>;
        `);
    });

    it('should handle stripping multiple newlines', () => {
      const {code} = transform(`
        export const whitespace = <i18n>


                                    Hello


                                    world!


                                  </i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <>{$jsxify(() => $localize\`Hello world!\`)}</>;
        `);
    });

    it('should replace a text with just whitespace/newlines with an empty string', () => {
      const {code} = transform(`
        export const whitespace = <i18n>  
   
   
                                    
                                  </i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <>{$jsxify(() => $localize\`\`)}</>;
        `);
    });

    it('should handle complex template with space and newlines', () => {
      const {code} = transform(`
        export const complexWhitespace = <i18n>
                                          Hello     <Greeting kind="wild">
                                          
                                            <b>
                                              
                                              <i>
                                              {name}
                                              </i>   !!!!!


                                            </b>
                                          </Greeting></i18n>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const complexWhitespace = <>{$jsxify(
            () => $localize\`Hello \${"�#0�"}:TAG_START_Greeting#0:\${"�#1�"}:TAG_START_b#1:\${"�#2�"}:TAG_START_i#2:\${"�#3/�"}:INTERPOLATION#3:\${"�/#2�"}:TAG_END_i#2: !!!!!\${"�/#1�"}:TAG_END_b#1:\${"�/#0�"}:TAG_END_Greeting#0:\`,
            [<Greeting kind="wild"></Greeting>, <b></b>, <i></i>, name]
          )}</>;
        `);
    });
  });
});