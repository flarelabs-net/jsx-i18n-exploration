import { describe, expect, it } from 'vitest';
import { transform } from './transform';
import { fragmentMessage } from '../src/scenarios/fragmentMessage';


describe('transform', () => {
  describe('simple JSX element translation', () => {
    it('should transform a simple JSX element', () => {
      const {code} = transform(`<div i18n>Hello world!</div>`, 'test');
      expect(code).toBe('<div>{$localize`Hello world!`}</div>');
    });

    it('should transform a simple JSX element with a description', () => {
      const {code} = transform('<div i18n="a friendly greeting">Hello world!</div>', 'test');
      expect(code).toBe('<div>{$localize`:a friendly greeting:Hello world!`}</div>');
    });

    it('should transform a simple JSX element with an id', () => {
      const {code} = transform('<div i18n="@@helloId">Hello world!</div>', 'test');
      expect(code).toBe('<div>{$localize`:@@helloId:Hello world!`}</div>');
    });

    it('should transform a simple JSX element with meaning', () => {
      const {code} = transform('<div i18n="login screen|">Hello world!</div>', 'test');
      expect(code).toBe('<div>{$localize`:login screen|:Hello world!`}</div>');
    });

    it('should transform a simple JSX element with meaning and description', () => {
      const {code} = transform('<div i18n="login screen|a friendly greeting">Hello world!</div>', 'test');
      expect(code).toBe('<div>{$localize`:login screen|a friendly greeting:Hello world!`}</div>');
    });

    it('should transform a simple JSX element with a description and an id', () => {
      const {code} = transform('<div i18n="a friendly greeting @@helloId">Hello world!</div>', 'test');
      expect(code).toBe('<div>{$localize`:a friendly greeting @@helloId:Hello world!`}</div>');
    });

    it('should transform a simple JSX element with a description, meaning, and id', () => {
      const {code} = transform('<div i18n="login screen|a friendly greeting@@helloId2">Hello world!</div>', 'test');
      expect(code).toBe('<div>{$localize`:login screen|a friendly greeting@@helloId2:Hello world!`}</div>');
    });
  });

  describe('JSX fragments', () => {
    it('should transform messages wrapped in JSX fragments', () => {
      const {code} = transform('<><div i18n>Hello world!</div></>', 'test');
      expect(code).toBe('<><div>{$localize`Hello world!`}</div></>');
    });

    describe('i18n element', () => {
      it('should transform messages wrapped in <i18n>', () => {
        const {code} = transform('<i18n>Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with a description', () => {
        const {code} = transform('<i18n description="a friendly greeting">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:a friendly greeting:Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with a id', () => {
        const {code} = transform('<i18n id="helloId">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:@@helloId:Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with meaning', () => {
        const {code} = transform('<i18n meaning="login screen">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:login screen|:Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with a description, meaning, and id', () => {
        const {code} = transform('<i18n description="a friendly greeting" meaning="login screen" id="helloId">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:login screen|a friendly greeting@@helloId:Hello world!`}</>');
      });
    });

  });

  describe('multiple messages', () => {
    it('should transform multiple messages in a single file', () => {
      const {code} = transform(`
        export const multipleMessages = {
          message1: <div i18n>Hello world!</div>,
          message2: <div i18n="a friendly bye bye">Have a nice day!</div>,
          fragment: (<><span></span><div i18n>Hello world!</div></>),
        }`, 'test');

      expect(code).toBe(`
        export const multipleMessages = {
          message1: <div>{$localize\`Hello world!\`}</div>,
          message2: <div>{$localize\`:a friendly bye bye:Have a nice day!\`}</div>,
          fragment: (<><span></span><div>{$localize\`Hello world!\`}</div></>),
        }`);
    });
  });

  describe('interpolation', () => {
    it('should transform messages with simple interpolation', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const interpolatedMessage = <div i18n>Hello {name}!</div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        const name = 'Jadzia';

        export const interpolatedMessage = <div>{$jsxify($localize\`Hello \${"�#0/�"}:INTERPOLATION#0:!\`, [name])}</div>;
        `);
    });

    it('should transform messages with an empty expression', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const interpolatedMessage = <div i18n>Hello{}!</div>;
        `, 'test');

      expect(code).toBe(`
        const name = 'Jadzia';

        export const interpolatedMessage = <div>{$localize\`Hello!\`}</div>;
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

        export const interpolatedMultiMessage =  <div i18n>{greeting} {name}! How was your {superlative} {event}? {no}{spaceInBetween}?</div>
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        const greeting = 'Hello';
        const name = 'Jadzia';
        const superlative = 'amazing';
        const event = 'birthday party';
        const no = 'no';
        const spaceInBetween = 'spaceInBetween';

        export const interpolatedMultiMessage =  <div>{$jsxify(
                        $localize\`\${"�#0/�"}:INTERPOLATION#0: \${"�#1/�"}:INTERPOLATION#1:! How was your \${"�#2/�"}:INTERPOLATION#2: \${"�#3/�"}:INTERPOLATION#3:? \${"�#4/�"}:INTERPOLATION#4:\${"�#5/�"}:INTERPOLATION#5:?\`,
                        [greeting, name, superlative, event, no, spaceInBetween]
                )}</div>
        `);
    });

    it('should transform messages with interpolation that returns a JSX component', () => {
      const {code} = transform(`
        const Greeting = () => <span>Hello</span>;
        const name = <span>Jadzia</span>;
        const greetingEmoji = '👋';
        
        export const interpolatedComponentMessage =  <div i18n>{ <Greeting/> } {name}! { greetingEmoji }</div>
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        const Greeting = () => <span>Hello</span>;
        const name = <span>Jadzia</span>;
        const greetingEmoji = '👋';

        export const interpolatedComponentMessage =  <div>{$jsxify(
                        $localize\`\${"�#0/�"}:INTERPOLATION#0: \${"�#1/�"}:INTERPOLATION#1:! \${"�#2/�"}:INTERPOLATION#2:\`,
                        [<Greeting/>, name, greetingEmoji]
                )}</div>
        `);
    });
  });

  describe('nested html and components', () => {
    it('should transform messages with nested html', () => {
      const {code} = transform(`
        export const nestedHtml = <div i18n>Hello <hr/></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        export const nestedHtml = <div>{$jsxify($localize\`Hello \${"�#0/�"}:TAG_hr#0:\`, [<hr/>])}</div>;
        `);
    });

    it('should transform messages with nested html', () => {
      const {code} = transform(`
        export const nestedHtml = <div i18n>Hello <span>world!</span></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        export const nestedHtml = <div>{$jsxify(
                        $localize\`Hello \${"�#0�"}:TAG_START_span#0:world!\${"�/#0�"}:TAG_END_span#0:\`,
                        [<span></span>]
                )}</div>;
        `);
    });

    it('should transform messages with nested html and interpolation', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const nestedHtml = <div i18n>Hello <b><i>my friend {firstName}</i></b>!</div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        const name = 'Jadzia';

        export const nestedHtml = <div>{$jsxify(
                        $localize\`Hello \${"�#0�"}:TAG_START_b#0:\${"�#1�"}:TAG_START_i#1:my friend \${"�#2/�"}:INTERPOLATION#2:\${"�/#1�"}:TAG_END_i#1:\${"�/#0�"}:TAG_END_b#0:!\`,
                        [<b></b>, <i></i>, firstName]
                )}</div>;
        `);
    });

    it('should transform messages with nested self-closing components', () => {
      const {code} = transform(`
        const Greeting = () => <span>Hello!</span>;
        export const nestedHtml = <div i18n>Hello <Greeting/></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        const Greeting = () => <span>Hello!</span>;
        export const nestedHtml = <div>{$jsxify($localize\`Hello \${"�#0/�"}:TAG_Greeting#0:\`, [<Greeting/>])}</div>;
        `);
    });

    it('should transform messages with nested components', () => {
      const {code} = transform(`
        export const nestedHtml = <div i18n>Hello <Greeting kind="wild">{name}</Greeting></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        export const nestedHtml = <div>{$jsxify(
                        $localize\`Hello \${"�#0�"}:TAG_START_Greeting#0:\${"�#1/�"}:INTERPOLATION#1:\${"�/#0�"}:TAG_END_Greeting#0:\`,
                        [<Greeting kind="wild"></Greeting>, name]
                )}</div>;
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
            <div i18n>Hello {loggedIn ? <UserProfile /> : 'world'}!</div>
          );
        `, 'test');

      expect(code).toBe(`
          import { $jsxify } from "jsx$localize/react";
          const loggedIn = true;
          const UserProfile = function () {
            return 'userprofile';
          };

          const nestedJSX = (
            <div>{$jsxify(
                $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:!\`,
                [loggedIn ? <UserProfile /> : 'world']
              )}</div>
          );
        `);
    });

  });

  describe('nested i18n', () => {

    it('should transform messages with nested i18n', () => {
      const {code} = transform(`
          const loggedIn = true;
          
          const nestedJSX = (
            <div i18n>
              Hello {loggedIn ? <span i18n>friend</span> : <span i18n>stranger</span>}
            </div>
          );
        `, 'test');

      expect(code).toBe(`
          import { $jsxify } from "jsx$localize/react";
          const loggedIn = true;

          const nestedJSX = (
            <div>{$jsxify($localize\`Hello \${"�#0/�"}:INTERPOLATION#0:\`, [
                loggedIn ? <span>{$localize\`friend\`}</span> : <span>{$localize\`stranger\`}</span>
              ])}</div>
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
        export const whitespace = <div i18n>Hello    world!</div>;
        `, 'test');

      expect(code).toBe(`
        export const whitespace = <div>{$localize\`Hello world!\`}</div>;
        `);
    });

    it('should collapse leading and trailing whitespace of a text enclosed by a tag on the same line', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>   Hello world!   </div>;
        `, 'test');

      expect(code).toBe(`
        export const whitespace = <div>{$localize\` Hello world! \`}</div>;
        `);
    });

    it('should remove leading and trailing whitespace of a text that is on a new line', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>
                                    Hello world!
                                  </div>;
        `, 'test');

      expect(code).toBe(`
        export const whitespace = <div>{$localize\`Hello world!\`}</div>;
        `);
    });

    it('should convert a newline within a text to a space', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>
                                    Hello
                                    world!
                                  </div>;
        `, 'test');

      expect(code).toBe(`
        export const whitespace = <div>{$localize\`Hello world!\`}</div>;
        `);
    });

    it('should handle stripping multiple newlines', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>


                                    Hello


                                    world!


                                  </div>;
        `, 'test');

      expect(code).toBe(`
        export const whitespace = <div>{$localize\`Hello world!\`}</div>;
        `);
    });

    it('should replace a text with just whitespace/newlines with an empty string', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>  
   
   
                                    
                                  </div>;
        `, 'test');

      expect(code).toBe(`
        export const whitespace = <div>{$localize\`\`}</div>;
        `);
    });

    it('should handle complex template with space and newlines', () => {
      const {code} = transform(`
        export const complexWhitespace = <div i18n>
                                          Hello     <Greeting kind="wild">
                                          
                                            <b>
                                              
                                              <i>
                                              {name}
                                              </i>   !!!!!


                                            </b>
                                          </Greeting></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        export const complexWhitespace = <div>{$jsxify(
            $localize\`Hello \${"�#0�"}:TAG_START_Greeting#0:\${"�#1�"}:TAG_START_b#1:\${"�#2�"}:TAG_START_i#2:\${"�#3/�"}:INTERPOLATION#3:\${"�/#2�"}:TAG_END_i#2: !!!!!\${"�/#1�"}:TAG_END_b#1:\${"�/#0�"}:TAG_END_Greeting#0:\`,
            [<Greeting kind="wild"></Greeting>, <b></b>, <i></i>, name]
          )}</div>;
        `);
    });
  });
});