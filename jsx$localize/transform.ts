import { parse, print, types } from "recast";
import typescriptParser from "recast/parsers/babel-ts";
import { TransformResult } from "vite";

export function transform(code: string, moduleId: string): TransformResult {
  const ast = parse(code, {
    sourceFileName: moduleId,
    parser: typescriptParser
  });

  const [i18nElements, i18nAttrs] = findAndCleanupAllI18nElements(ast.program.body);

  if (i18nElements.length > 0 || i18nAttrs.length > 0) {
    const shouldInjectJsxifyImport = rewriteI18nElements(i18nElements, i18nAttrs);

    if (shouldInjectJsxifyImport) {
      addJsxifyImport(ast.program.body);
    }
  }

  const transformed = print(ast, {
    sourceMapName: moduleId
  });

  return {
    code: transformed.code,
    map: transformed.map
  };
}


function findAndCleanupAllI18nElements(rootNode: types.ASTNode): [types.namedTypes.JSXElement[], types.namedTypes.JSXAttribute[]] {
  const i18nElements: types.namedTypes.JSXElement[] = [];
  const i18nAttrs: types.namedTypes.JSXAttribute[] = [];

  types.visit(rootNode, {
    visitJSXElement(path) {
      const node = path.node;
      const i18nAttr = node.openingElement.attributes?.find((attr, index) => {
        if (types.namedTypes.JSXAttribute.check(attr) && attr.name.name === 'i18n') {
          // Drop the i18n attribute
          node.openingElement.attributes?.splice(index, 1);
          return true;
        }
      }) as types.namedTypes.JSXAttribute | undefined;
      
      if (i18nAttr) {
        i18nAttrs.push(i18nAttr);
        i18nElements.push(node);
      }
      this.traverse(path);
    }
  });

  return [i18nElements, i18nAttrs];
}

function rewriteI18nElements(i18nElements: types.namedTypes.JSXElement[], i18nAttrs: types.namedTypes.JSXAttribute[]) {
  let elementsContainElement = false;

  i18nElements.forEach((i18nElement, elementIndex) => {

    let i18nAttr = i18nAttrs[elementIndex];
    let i18nAttrValue = i18nAttr.value;

    if (i18nAttrValue && !types.namedTypes.Literal.check(i18nAttrValue)) throw new Error('i18n attribute value must be a literal, was: ' + i18nAttrValue?.type);

    const templateExpressions: types.namedTypes.ExpressionStatement['expression'][] = [];
    const templateQuasis: types.namedTypes.TemplateElement[] = [];
    let childJSXElements: Array<types.namedTypes.JSXElement> = [];
    let interpolationCounter = 0;

    i18nElement.children?.forEach((i18nMessagePart, i18nMessagePartIndex) => {

      const isFirstI18nMessagePart = i18nMessagePartIndex === 0;
      const isLastI18nMessagePart = i18nMessagePartIndex === i18nElement.children!.length - 1;
      // The first child needs to be prefixed with description, meaning, and/or id (if defined)
      const translationMessagePrefix = (isFirstI18nMessagePart && i18nAttrValue) ? `:${i18nAttrValue.value}:` : '';

      processI18nMessagePart(i18nMessagePart as any, isFirstI18nMessagePart, isLastI18nMessagePart, translationMessagePrefix);
      
    });

    function processI18nMessagePart(i18nMessagePart: types.namedTypes.JSXText | types.namedTypes.JSXElement | types.namedTypes.JSXExpressionContainer, isFirstI18nMessagePart: boolean, isLastI18nMessagePart:boolean, translationMessagePrefix: string) {
      
      if (types.namedTypes.JSXText.check(i18nMessagePart)) {

        if (templateQuasis.length === templateExpressions.length) {

          // add a new quasis, since we have matching pairs of quasis and expressions
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: translationMessagePrefix + normalizeWhitespace(i18nMessagePart.value),
              cooked: translationMessagePrefix + normalizeWhitespace(i18nMessagePart.value)
            },
            tail: isLastI18nMessagePart,
            loc: i18nMessagePart.loc
          }));

        } else {
          
          // we have more quasis than expressions, so let's append to the last one
          const lastQuasis = templateQuasis.at(-1);
          lastQuasis!.value.raw = lastQuasis!.value.raw + normalizeWhitespace(i18nMessagePart.value);
          lastQuasis!.value.cooked = lastQuasis!.value.cooked + normalizeWhitespace(i18nMessagePart.value);

        }

      } else if (types.namedTypes.JSXExpressionContainer.check(i18nMessagePart)) {
          
        if (isFirstI18nMessagePart) {
          // add an empty template element to the quasis since original element starts with an interpolation
          // but tagged templates always start with a string, even if it's an empty string
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: translationMessagePrefix,
              cooked: translationMessagePrefix
            },
            tail: false
          }));
        }

        if (types.namedTypes.JSXEmptyExpression.check(i18nMessagePart.expression)) {
          // if it's an empty expression, we don't need to do anything
          return;
        }

        const interpolationId = interpolationCounter++;

        templateExpressions.push(i18nMessagePart.expression);
        templateQuasis.push(types.builders.templateElement.from({
          value: {
            raw: `:INTERPOLATION_${interpolationId}:`,
            cooked: `:INTERPOLATION_${interpolationId}:`
          },
          tail: isLastI18nMessagePart
        }));

      } else if (types.namedTypes.JSXElement.check(i18nMessagePart)) {

        const childJSXElementId = childJSXElements.length;
        childJSXElements.push(i18nMessagePart);

        const openingElementNameNode = i18nMessagePart.openingElement.name;
          
        if (!types.namedTypes.JSXIdentifier.check(openingElementNameNode)) {
          throw new Error('Unsupported opening JSX element name type: ' + openingElementNameNode.type);
        }

        const openingElementName = openingElementNameNode.name;

        if (i18nMessagePart.openingElement.selfClosing) {
          const elementPlaceholder = types.builders.literal.from({
            value: '\uFFFD#' + childJSXElementId + '/\uFFFD'
          });
          templateExpressions.push(elementPlaceholder);

          const tagPlaceholderSuffix = `:TAG_${openingElementName}#${childJSXElementId}:`;
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: tagPlaceholderSuffix,
              cooked: tagPlaceholderSuffix
            },
            tail: isLastI18nMessagePart
          }));

        } else {

          const elementStartPlaceholder = types.builders.literal.from({
            value: '\uFFFD#' + childJSXElementId + '\uFFFD'
          });
          templateExpressions.push(elementStartPlaceholder);

          

          const startTagPlaceholderSuffix = `:TAG_START_${openingElementName}#${childJSXElementId}:`;
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: startTagPlaceholderSuffix,
              cooked: startTagPlaceholderSuffix
            },
            tail: false
          }));

          i18nMessagePart.children?.forEach((child) => {
            processI18nMessagePart(child as any, false, false, '');
          });
          i18nMessagePart.children = [];

          const elementEndPlaceholder = types.builders.literal.from({
            value: '\uFFFD/#' + childJSXElementId + '\uFFFD'
          });
          templateExpressions.push(elementEndPlaceholder);

          const endTagPlaceholderSuffix = `:TAG_END_${openingElementName}#${childJSXElementId}:`;
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: endTagPlaceholderSuffix,
              cooked: endTagPlaceholderSuffix,
            },
            tail: isLastI18nMessagePart
          }));

        }
      } else {
        // @ts-ignore
        throw new Error('Unexpected child type: ' + i18nMessagePart.type + i18nMessagePart.value);
      }
    }

    const $localizeExpression = types.builders.taggedTemplateExpression.from({
      tag: types.builders.identifier.from({ name: '$localize' }),
      quasi: types.builders.templateLiteral.from({
        expressions: templateExpressions,
        quasis: templateQuasis
      })
    });

    if (childJSXElements.length > 0) {
      elementsContainElement = true;

      const $jsxifyExpression = types.builders.callExpression.from({
        callee: types.builders.identifier.from({ name: '$jsxify' }),
        arguments: [
          $localizeExpression,
          types.builders.arrayExpression.from({
            elements: childJSXElements
          })
        ]
      });

      i18nElement.children = [types.builders.jsxExpressionContainer($jsxifyExpression)];

    } else {
      i18nElement.children = [types.builders.jsxExpressionContainer($localizeExpression)];
    }
  });

  return elementsContainElement;
}

function addJsxifyImport(rootNode: Array<types.ASTNode>) {
  const importDeclaration = types.builders.importDeclaration(
    [types.builders.importSpecifier.from({
      imported: types.builders.identifier.from({ name: '$jsxify' }),
      local: types.builders.identifier.from({ name: '$jsxify' })
    })],
    types.builders.literal.from({ value: 'jsx$localize/react' })
  );

  rootNode.unshift(importDeclaration);
}



/*
  Basic Whitespace Rules in JSX
  1. Adjacent whitespace characters are collapsed into a single space
      - Multiple spaces, tabs, and newlines are treated as a single space
  2. Leading and trailing whitespace in a line is removed
      - Whitespace at the beginning and end of JSX lines is ignored
  3. Line breaks between elements are ignored
      - But line breaks within text are preserved as spaces
*/
function normalizeWhitespace(text: string): string {
  return text
            // line breaks within text are preserved as spaces
            .replace(/(?<=\S)(\s*\n\s*)+(?=\S)/g, ' ')
            // leading and trailing whitespace in a line is removed
            .replace(/^\n\s*|\s*\n\s*$/g, '')
            // adjacent whitespace characters are collapsed into a single space 
            .replace(/\s+/g, ' ');
}