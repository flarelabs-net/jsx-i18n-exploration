import { parse, print, types } from "recast";
import typescriptParser from "recast/parsers/babel-ts";
import { TransformResult } from "vite";

export function transform(code: string, moduleId: string): TransformResult {
  const ast = parse(code, {
    sourceFileName: moduleId,
    parser: typescriptParser
  });

  const [i18nElements, i18nElementMetadata] = findAndCleanupAllI18nMarkers(ast.program.body);

  if (i18nElements.length > 0) {
    const shouldInjectJsxifyImport = rewriteI18nElements(i18nElements, i18nElementMetadata);

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


function findAndCleanupAllI18nMarkers(rootNode: types.ASTNode): [types.namedTypes.JSXElement[], string[]] {
  const i18nElements: types.namedTypes.JSXElement[] = [];
  const i18nMetadata: string[] = [];

  types.visit(rootNode, {
    visitJSXElement(path) {
      const elementNode = path.node;
      let meaning = '';
      let description = '';
      let id = '';
      
      if (types.namedTypes.JSXIdentifier.check(elementNode.openingElement.name) &&
            elementNode.openingElement.name.name === 'i18n') {

              elementNode.openingElement.attributes?.forEach((attr) => {
                if (!types.namedTypes.JSXAttribute.check(attr)) {
                  throw new Error('Unsupported attribute type: ' + attr.type);
                }

                if (!types.namedTypes.Literal.check(attr.value)) {
                  throw new Error('Unsupported attribute value type: ' + attr.value!.type);
                }

                switch (attr.name.name) {
                  case 'meaning': {
                    meaning = `${attr.value.value}`;
                    break;
                  }
                  case 'description': {
                    description = `${attr.value.value}`;
                    break;
                  }
                  case 'id': {
                    id = `${attr.value.value}`;
                    break;
                  }
                }
            });

            // compose the i18n metadata
            const i18nMetadataInfo = (meaning ? `${meaning}|` : '') +
                                    (description ? description : '') +
                                    (id ? `@@${id}` : '');

            i18nMetadata.push(i18nMetadataInfo);

            // replace <i18n>...</i18n> with <>...</>
            path.replace(types.builders.jsxFragment.from({
              openingFragment: types.builders.jsxOpeningFragment(),
              closingFragment: types.builders.jsxClosingFragment(),
              children: elementNode.children
            }));

            i18nElements.push(path.node);

      } else {
        // look for i18n attribute that identifies a translation block
        const i18nAttr = elementNode.openingElement.attributes?.find((attr, index) => {
          if (types.namedTypes.JSXAttribute.check(attr) &&
              typeof attr.name.name === 'string' && 
              attr.name.name === 'i18n') {
            // Drop the i18n attribute
            elementNode.openingElement.attributes?.splice(index, 1);
            return true;
          }
        }) as types.namedTypes.JSXAttribute | undefined;

        if (i18nAttr) {
          const i18nAttrValue = i18nAttr.value;

          if (i18nAttrValue && !types.namedTypes.Literal.check(i18nAttrValue)) {
            throw new Error('i18n attribute value must be a literal, was: ' + i18nAttrValue?.type);
          }

          i18nMetadata.push(`${i18nAttrValue?.value ?? ''}`);
          i18nElements.push(elementNode);
        }

        // look for i18n-attr-* attributes on the current element that identify internationalizable attributes
        const i18nAttrStarAttrs = elementNode.openingElement.attributes?.filter((attr, index) => {
          if (types.namedTypes.JSXAttribute.check(attr) &&
              typeof attr.name.name === 'string' && 
              attr.name.name.startsWith('i18n-attr-')) {
            // Drop the i18n-attr-* attribute
            elementNode.openingElement.attributes?.splice(index, 1);
            return true;
          }
        }) as types.namedTypes.JSXAttribute[];

        i18nAttrStarAttrs?.forEach((i18nAttrStarAttr) => {
          if (typeof i18nAttrStarAttr.name.name !== 'string') {
            throw new Error('i18n-attr-* attribute name must be a string, was: ' + i18nAttrStarAttr.name.name.type);
          }
          
          const i18nAttrStarAttrName = i18nAttrStarAttr.name.name;
          const attrName = i18nAttrStarAttrName.replace('i18n-attr-', '');

          const matchingAttr = elementNode.openingElement.attributes?.find(attr => {
            if (types.namedTypes.JSXAttribute.check(attr) &&
                types.namedTypes.JSXIdentifier.check(attr.name) &&
                attr.name.name === attrName) {
              return true;
            }});

          if (!matchingAttr) {
              // @ts-ignore
              throw new Error(`i18n error: attribute '${i18nAttrStarAttrName}' doesn't have matching peer attribute '${attrName}' on element '${elementNode.openingElement.name.name}'`);
          }

          if (!types.namedTypes.JSXAttribute.check(matchingAttr)) {
            throw new Error('Unsupported attribute type: ' + matchingAttr.type);
          }

          const i18nAttrValue = i18nAttrStarAttr.value;

          if (i18nAttrValue && !types.namedTypes.Literal.check(i18nAttrValue)) {
            throw new Error(`i18n error: value of attribute '${i18nAttrStarAttrName}' must be a literal, was: ${i18nAttrValue?.type}`);
          }
          
          const i18nMetadata = i18nAttrValue ? `${i18nAttrValue?.value}` : '';

          rewriteI18nAttribute(matchingAttr, i18nMetadata);
        });
      }
      this.traverse(path);
    }
  });

  return [i18nElements, i18nMetadata];
}

function rewriteI18nElements(i18nElements: types.namedTypes.JSXElement[], i18nMetadata: string[]) {
  let elementsContainElement = false;

  i18nElements.forEach((i18nElement, elementIndex) => {

    const templateExpressions: types.namedTypes.ExpressionStatement['expression'][] = [];
    const templateQuasis: types.namedTypes.TemplateElement[] = [];
    let placeholderExpressions: Array<types.namedTypes.JSXElement | Exclude<types.namedTypes.JSXExpressionContainer['expression'], types.namedTypes.JSXEmptyExpression>> = [];

    let messageMetadata = i18nMetadata[elementIndex];
    // The message needs to be prefixed with description, meaning, and/or id (if defined)
    const translationMessagePrefix = messageMetadata ? `:${messageMetadata}:` : '';

    // Initialize templateQuasis with the message the description prefix
    templateQuasis.push(types.builders.templateElement.from({
      value: {
        raw: translationMessagePrefix,
        cooked: translationMessagePrefix
      },
      tail: false
    }));

    i18nElement.children?.forEach((i18nMessagePart, i18nMessagePartIndex) => {

      const isLastI18nMessagePart = i18nMessagePartIndex === i18nElement.children!.length - 1;

      processI18nMessagePart(i18nMessagePart as any, isLastI18nMessagePart);
      
    });

    function processI18nMessagePart(i18nMessagePart: types.namedTypes.JSXText | types.namedTypes.JSXElement | types.namedTypes.JSXExpressionContainer, isLastI18nMessagePart:boolean) {
      
      if (types.namedTypes.JSXText.check(i18nMessagePart)) {

        if (templateQuasis.length === templateExpressions.length) {

          // we have matching pairs of quasis and expressions, meaning that an expression was added last, so let's add the new text as a new quasis to keep the alternating order
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: normalizeWhitespace(i18nMessagePart.value),
              cooked: normalizeWhitespace(i18nMessagePart.value)
            },
            tail: isLastI18nMessagePart,
            loc: i18nMessagePart.loc
          }));

        } else {
          
          // we have more quasis than expressions, so let's append to the last one, to keep on alternating the two
          const lastQuasis = templateQuasis.at(-1);
          lastQuasis!.value.raw = lastQuasis!.value.raw + normalizeWhitespace(i18nMessagePart.value);
          lastQuasis!.value.cooked = lastQuasis!.value.cooked + normalizeWhitespace(i18nMessagePart.value);

        }

      } else if (types.namedTypes.JSXExpressionContainer.check(i18nMessagePart)) {
        
        if (types.namedTypes.JSXEmptyExpression.check(i18nMessagePart.expression)) {
          // if it's an empty expression, we don't need to do anything
          return;
        }

        const placeholderId = placeholderExpressions.length;
        
        templateExpressions.push(types.builders.literal.from({
          value: '\uFFFD#' + placeholderId + '/\uFFFD'
        }));

        const interpolationPlaceholderSuffix = `:INTERPOLATION#${placeholderId}:`;
        templateQuasis.push(types.builders.templateElement.from({
          value: {
            raw: interpolationPlaceholderSuffix,
            cooked: interpolationPlaceholderSuffix
          },
          tail: isLastI18nMessagePart
        }));
        
        placeholderExpressions.push(i18nMessagePart.expression);

      } else if (types.namedTypes.JSXElement.check(i18nMessagePart)) {

        const placeholderId = placeholderExpressions.length;
        placeholderExpressions.push(i18nMessagePart);

        const openingElementNameNode = i18nMessagePart.openingElement.name;
          
        if (!types.namedTypes.JSXIdentifier.check(openingElementNameNode)) {
          throw new Error('Unsupported opening JSX element name type: ' + openingElementNameNode.type);
        }

        const openingElementName = openingElementNameNode.name;

        if (i18nMessagePart.openingElement.selfClosing) {
          
          // self-closing placeholder
          templateExpressions.push(types.builders.literal.from({
            value: '\uFFFD#' + placeholderId + '/\uFFFD'
          }));

          // self-closing comment
          const tagPlaceholderSuffix = `:TAG_${openingElementName}#${placeholderId}:`;
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: tagPlaceholderSuffix,
              cooked: tagPlaceholderSuffix
            },
            tail: isLastI18nMessagePart
          }));

        } else {

          // start placeholder
          templateExpressions.push(types.builders.literal.from({
            value: '\uFFFD#' + placeholderId + '\uFFFD'
          }));

          // start comment
          const startTagPlaceholderSuffix = `:TAG_START_${openingElementName}#${placeholderId}:`;
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: startTagPlaceholderSuffix,
              cooked: startTagPlaceholderSuffix
            },
            tail: false
          }));

          // recurse
          i18nMessagePart.children?.forEach((child) => {
            processI18nMessagePart(child as any, false);
          });
          i18nMessagePart.children = [];

          // end placeholder
          templateExpressions.push(types.builders.literal.from({
            value: '\uFFFD/#' + placeholderId + '\uFFFD'
          }));

          // end comment
          const endTagPlaceholderSuffix = `:TAG_END_${openingElementName}#${placeholderId}:`;
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

    if (placeholderExpressions.length > 0) {
      elementsContainElement = true;

      const $jsxifyExpression = types.builders.callExpression.from({
        callee: types.builders.identifier.from({ name: '$jsxify' }),
        arguments: [
          $localizeExpression,
          types.builders.arrayExpression.from({
            elements: placeholderExpressions
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


function rewriteI18nAttribute(attribute: types.namedTypes.JSXAttribute, i18nAttrStarMetadata: string) {
    if (!types.namedTypes.Literal.check(attribute.value)) {
      throw new Error(`i18n error: value of attribute '${attribute.name.name}' must be a literal, was: ${attribute.value?.type}`);
    }

    const attrValue = attribute.value.value;
    const valueMetadataPrefix = i18nAttrStarMetadata ? `:${i18nAttrStarMetadata}:` : '';

    const $localizeExpression = types.builders.taggedTemplateExpression.from({
      tag: types.builders.identifier.from({ name: '$localize' }),
      quasi: types.builders.templateLiteral.from({
        expressions: [],
        quasis: [types.builders.templateElement.from({
          value: {
            raw: `${valueMetadataPrefix}${attrValue}`,
            cooked: `${valueMetadataPrefix}${attrValue}`
          },
          tail: false
        })]
      })
    });

    attribute.value = types.builders.jsxExpressionContainer.from({
      expression: $localizeExpression
    });
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