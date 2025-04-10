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

    // TODO: add support for transforming <i18n/>
    describe.skip('i18n element', () => {
      it('should transform messages wrapped in <i18n>', () => {
        const {code} = transform('<i18n>Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with a description', () => {
        const {code} = transform('<i18n description="a friendly greeting">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:a friendly greeting:Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with a id', () => {
        const {code} = transform('<i18n description="@@helloId">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:@@helloId:Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with meaning', () => {
        const {code} = transform('<i18n meaning="login screen">Hello world!</i18n>', 'test');
        expect(code).toBe('<>{$localize`:login screen|:Hello world!`}</>');
      });

      it('should transform messages wrapped in <i18n> with a description, meaning, and id', () => {
        const {code} = transform('<i18n description="a friendly greeting" meaning="login screen" id="@@helloId">Hello world!</i18n>', 'test');
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
        const name = 'Jadzia';

        export const interpolatedMessage = <div>{$localize\`Hello \${name}!\`}</div>;
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
        const greeting = 'Hello';
        const name = 'Jadzia';
        const superlative = 'amazing';
        const event = 'birthday party';
        const no = 'no';
        const spaceInBetween = 'spaceInBetween';

        export const interpolatedMultiMessage =  <div>{$localize\`\${greeting} \${name}! How was your \${superlative} \${event}? \${no}\${spaceInBetween}?\`}</div>
        `);
    });
  });

  describe('nested html', () => {
    it.only('should transform messages with nested html', () => {
      const {code} = transform(`
        export const nestedHtml = <div i18n>Hello <span>world!</span></div>;
        `, 'test');

      expect(code).toBe(`
        import { $jsxify } from "jsx$localize/react";
        export const nestedHtml = <div>{$jsxify($localize\`Hello \${'\uFFFD#0\uFFFD'}:START_TAG_SPAN:world!\${'\uFFFD/#0\uFFFD'}:END_TAG_SPAN:\`, [<span></span>])}</div>;
        `);
    });

    it('should transform messages with nested html and interpolation', () => {
      const {code} = transform(`
        const name = 'Jadzia';

        export const nestedHtml = <div i18n>Hello <b><i>my friend {firstName}</i></b>!</div>;
        `, 'test');

      expect(code).toBe(`
        const name = 'Jadzia';

        export const nestedHtml = <div>{$jsxify(
    $localize\`Hello \${'\uFFFD#0\uFFFD'}:START_TAG_B:\${'\uFFFD#1\uFFFD'}:START_TAG_I:my friend \${firstName}:INTERPOLATION:\${'\uFFFD/#1\uFFFD'}:END_TAG_I:\${'\uFFFD/#0\uFFFD'}:END_TAG_B:!\`, [<b></b>, <i></i>,])}</div>;
        `);
    });
  });
});