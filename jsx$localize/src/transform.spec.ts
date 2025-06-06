import { describe, expect, it } from 'vitest';
import { transform } from './transform';


describe('transform', () => {
  describe('simple JSX element translation', () => {
    
    it('should transform a simple JSX element', () => {
      const {code} = transform(`
        <div i18n>Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`Hello world!\`)}</div>
      `);
    });

    it('should transform a simple JSX element with a description', () => {
      const {code} = transform(`
        <div i18n="a friendly greeting">Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`:a friendly greeting:Hello world!\`)}</div>
      `);
    });

    it('should transform a simple JSX element with an id', () => {
      const {code} = transform(`
        <div i18n="@@helloId">Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`:@@helloId:Hello world!\`)}</div>
      `);
    });

    it('should transform a simple JSX element with meaning', () => {
      const {code} = transform(`
        <div i18n="login screen|">Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`:login screen|:Hello world!\`)}</div>
      `);
    });

    it('should transform a simple JSX element with meaning and description', () => {
      const {code} = transform(`
        <div i18n="login screen|a friendly greeting">Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`:login screen|a friendly greeting:Hello world!\`)}</div>
      `);
    });

    it('should transform a simple JSX element with a description and an id', () => {
      const {code} = transform(`
        <div i18n="a friendly greeting @@helloId">Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`:a friendly greeting @@helloId:Hello world!\`)}</div>
      `);
    });

    it('should transform a simple JSX element with a description, meaning, and id', () => {
      const {code} = transform(`
        <div i18n="login screen|a friendly greeting@@helloId2">Hello world!</div>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <div>{$jsxify(() => $localize\`:login screen|a friendly greeting@@helloId2:Hello world!\`)}</div>
      `);
    });
  });

  describe('JSX fragments', () => {
    it('should transform messages wrapped in JSX fragments', () => {
      const {code} = transform(`
        <><div i18n>Hello world!</div></>
      `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        <><div>{$jsxify(() => $localize\`Hello world!\`)}</div></>
      `);
    });

    describe('i18n element', () => {
      it('should transform messages wrapped in <i18n>', () => {
        const {code} = transform(`
          <i18n>Hello world!</i18n>
        `, 'test');

        expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          <>{$jsxify(() => $localize\`Hello world!\`)}</>
        `);
      });

      it('should transform messages wrapped in <i18n> with a description', () => {
        const {code} = transform(`
          <i18n description="a friendly greeting">Hello world!</i18n>
        `, 'test');

        expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          <>{$jsxify(() => $localize\`:a friendly greeting:Hello world!\`)}</>
        `);
      });

      it('should transform messages wrapped in <i18n> with a id', () => {
        const {code} = transform(`
          <i18n id="helloId">Hello world!</i18n>
        `, 'test');

        expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          <>{$jsxify(() => $localize\`:@@helloId:Hello world!\`)}</>
        `);
      });

      it('should transform messages wrapped in <i18n> with meaning', () => {
        const {code} = transform(`
          <i18n meaning="login screen">Hello world!</i18n>
        `, 'test');

        expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          <>{$jsxify(() => $localize\`:login screen|:Hello world!\`)}</>
        `);
      });

      it('should transform messages wrapped in <i18n> with a description, meaning, and id', () => {
        const {code} = transform(`
          <i18n description="a friendly greeting" meaning="login screen" id="helloId">Hello world!</i18n>
        `, 'test');

        expect(code).toBe(`
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          <>{$jsxify(() => $localize\`:login screen|a friendly greeting@@helloId:Hello world!\`)}</>
        `);
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const multipleMessages = {
          message1: <div>{$jsxify(() => $localize\`Hello world!\`)}</div>,
          message2: <div>{$jsxify(() => $localize\`:a friendly bye bye:Have a nice day!\`)}</div>,
          fragment: (<><span></span><div>{$jsxify(() => $localize\`Hello world!\`)}</div></>),
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const name = 'Jadzia';

        export const interpolatedMessage = <div>{$jsxify(() => $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:!\`, [name])}</div>;
        `);
    });

    it('should transform messages with an empty expression', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const interpolatedMessage = <div i18n>Hello{}!</div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const name = 'Jadzia';

        export const interpolatedMessage = <div>{$jsxify(() => $localize\`Hello!\`)}</div>;
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const greeting = 'Hello';
        const name = 'Jadzia';
        const superlative = 'amazing';
        const event = 'birthday party';
        const no = 'no';
        const spaceInBetween = 'spaceInBetween';

        export const interpolatedMultiMessage =  <div>{$jsxify(
                        () => $localize\`\${"�#0/�"}:INTERPOLATION#0: \${"�#1/�"}:INTERPOLATION#1:! How was your \${"�#2/�"}:INTERPOLATION#2: \${"�#3/�"}:INTERPOLATION#3:? \${"�#4/�"}:INTERPOLATION#4:\${"�#5/�"}:INTERPOLATION#5:?\`,
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const Greeting = () => <span>Hello</span>;
        const name = <span>Jadzia</span>;
        const greetingEmoji = '👋';

        export const interpolatedComponentMessage =  <div>{$jsxify(
                        () => $localize\`\${"�#0/�"}:INTERPOLATION#0: \${"�#1/�"}:INTERPOLATION#1:! \${"�#2/�"}:INTERPOLATION#2:\`,
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const nestedHtml = <div>{$jsxify(() => $localize\`Hello \${"�#0/�"}:TAG_hr#0:\`, [<hr/>])}</div>;
        `);
    });

    it('should transform messages with nested html', () => {
      const {code} = transform(`
        export const nestedHtml = <div i18n>Hello <span>world!</span></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const nestedHtml = <div>{$jsxify(
                        () => $localize\`Hello \${"�#0�"}:TAG_START_span#0:world!\${"�/#0�"}:TAG_END_span#0:\`,
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const name = 'Jadzia';

        export const nestedHtml = <div>{$jsxify(
                        () => $localize\`Hello \${"�#0�"}:TAG_START_b#0:\${"�#1�"}:TAG_START_i#1:my friend \${"�#2/�"}:INTERPOLATION#2:\${"�/#1�"}:TAG_END_i#1:\${"�/#0�"}:TAG_END_b#0:!\`,
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        const Greeting = () => <span>Hello!</span>;
        export const nestedHtml = <div>{$jsxify(() => $localize\`Hello \${"�#0/�"}:TAG_Greeting#0:\`, [<Greeting/>])}</div>;
        `);
    });

    it('should transform messages with nested components', () => {
      const {code} = transform(`
        export const nestedHtml = <div i18n>Hello <Greeting kind="wild">{name}</Greeting></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const nestedHtml = <div>{$jsxify(
                        () => $localize\`Hello \${"�#0�"}:TAG_START_Greeting#0:\${"�#1/�"}:INTERPOLATION#1:\${"�/#0�"}:TAG_END_Greeting#0:\`,
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
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          const loggedIn = true;
          const UserProfile = function () {
            return 'userprofile';
          };

          const nestedJSX = (
            <div>{$jsxify(
                () => $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:!\`,
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
          import { $jsxify } from "@flarelabs-net/jsx-localize/react";
          const loggedIn = true;

          const nestedJSX = (
            <div>{$jsxify(() => $localize\`Hello \${"�#0/�"}:INTERPOLATION#0:\`, [
                loggedIn ? <span>{$jsxify(() => $localize\`friend\`)}</span> : <span>{$jsxify(() => $localize\`stranger\`)}</span>
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <div>{$jsxify(() => $localize\`Hello world!\`)}</div>;
        `);
    });

    it('should collapse leading and trailing whitespace of a text enclosed by a tag on the same line', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>   Hello world!   </div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <div>{$jsxify(() => $localize\` Hello world! \`)}</div>;
        `);
    });

    it('should remove leading and trailing whitespace of a text that is on a new line', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>
                                    Hello world!
                                  </div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <div>{$jsxify(() => $localize\`Hello world!\`)}</div>;
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <div>{$jsxify(() => $localize\`Hello world!\`)}</div>;
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <div>{$jsxify(() => $localize\`Hello world!\`)}</div>;
        `);
    });

    it('should replace a text with just whitespace/newlines with an empty string', () => {
      const {code} = transform(`
        export const whitespace = <div i18n>  
   
   
                                    
                                  </div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const whitespace = <div>{$jsxify(() => $localize\`\`)}</div>;
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
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const complexWhitespace = <div>{$jsxify(
            () => $localize\`Hello \${"�#0�"}:TAG_START_Greeting#0:\${"�#1�"}:TAG_START_b#1:\${"�#2�"}:TAG_START_i#2:\${"�#3/�"}:INTERPOLATION#3:\${"�/#2�"}:TAG_END_i#2: !!!!!\${"�/#1�"}:TAG_END_b#1:\${"�/#0�"}:TAG_END_Greeting#0:\`,
            [<Greeting kind="wild"></Greeting>, <b></b>, <i></i>, name]
          )}</div>;
        `);
    });
  });

  describe('i18n-* pseudo attribute', () => {

    it('should transform a simple i18n-* attribute', () => {
      const {code} = transform(`
        export const i18nAttr = <img alt="a cute puppy pic" i18n-alt/>;
        `, 'test');

      expect(code).toBe(`
        export const i18nAttr = <img alt={$localize\`a cute puppy pic\`} />;
        `);
    });

    it('should transform a simple i18n-* attribute with description', () => {
      const {code} = transform(`
        export const i18nAttr = <img alt="a cute puppy pic" i18n-alt="puppy image title text"/>;
        `, 'test');

      expect(code).toBe(`
        export const i18nAttr = <img alt={$localize\`:puppy image title text:a cute puppy pic\`} />;
        `);
    });

    it('should transform a simple i18n-* attribute with meaning', () => {
      const {code} = transform(`
        export const i18nAttr = <img alt="a cute puppy pic" i18n-alt="login screen|"/>;
        `, 'test');

      expect(code).toBe(`
        export const i18nAttr = <img alt={$localize\`:login screen|:a cute puppy pic\`} />;
        `);
    });

    it('should transform a simple i18n-* attribute with id', () => {
      const {code} = transform(`
        export const i18nAttr = <img alt="a cute puppy pic" i18n-alt="@@myTitleId"/>;
        `, 'test');

      expect(code).toBe(`
        export const i18nAttr = <img alt={$localize\`:@@myTitleId:a cute puppy pic\`} />;
        `);
    });

    it('should transform a simple i18n-* attribute with meaning, description, and id', () => {
      const {code} = transform(`
        export const i18nAttr = <img alt="a cute puppy pic" i18n-alt="login screen|puppy image title text@@myTitleId"/>;
        `, 'test');

      expect(code).toBe(`
        export const i18nAttr = <img
                alt={$localize\`:login screen|puppy image title text@@myTitleId:a cute puppy pic\`} />;
        `);
    });

    it('should transform multiple i18n-* attribute attributes', () => {
      const {code} = transform(`
        export const i18nAttrMultiple = <img alt="a cute puppy pic" i18n-alt
                                             src="some-img.png" i18n-src
                                             foo="bar" i18n-foo />;
        `, 'test');

      expect(code).toBe(`
        export const i18nAttrMultiple = <img
                alt={$localize\`a cute puppy pic\`}
                src={$localize\`some-img.png\`}
                foo={$localize\`bar\`} />;
        `);
    });

    it('should transform an i18n-* attribute on i18n blocks and nested within', () => {
      const {code} = transform(`
        export const i18nAttrNested = <p i18n title="some title" i18n-title>
            <img alt="a cute puppy pic" i18n-alt/>
          </p>
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "@flarelabs-net/jsx-localize/react";
        export const i18nAttrNested = <p title={$localize\`some title\`}>{$jsxify(
            () => $localize\`\${"�#0/�"}:TAG_img#0:\`,
            [<img alt={$localize\`a cute puppy pic\`} />]
          )}</p>
        `);
    });

    it('should error if i18n-* attribute attribute is bound to an expression', () => {
      expect(() => {
        transform(`
          export const i18nAttr = <img i18n-alt={'foo'} alt="foo"/>;
          `, 'test');
      }).toThrow(`i18n error: value of attribute 'i18n-alt' must be a literal, was: JSXExpressionContainer`);
    });

    it('should error if i18n-* attribute points to an attribute bound to an expression', () => {
      expect(() => {
        transform(`
          export const i18nAttr = <img i18n-alt alt={'foo'}/>;
          `, 'test');
      }).toThrow(`i18n error: value of attribute 'alt' must be a literal, was: JSXExpressionContainer`);
    });


    it(`should error if i18n-* attribute is used without a matching attribute`, () => {
      expect(() => {
        transform(`
          export const i18nAttr = <img i18n-title/>;
          `, 'test');
      }).toThrow(`i18n error: attribute 'i18n-title' doesn't have matching peer attribute 'title' on element 'img'`);
    });

  });
});