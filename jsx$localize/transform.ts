import { parse, print, types } from "recast";
import { TransformResult } from "vite";

export function transform(code: string, moduleId: string): TransformResult {
  const ast = parse(code, {
    sourceFileName: moduleId
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
    let previousChildWasAnExpression = false;
    let childContainsElement = false;

    i18nElement.children?.forEach((child, childIndex) => {

      // The first child needs to be prefixed with description, meaning, and/or id (if defined)
      const translationMessagePrefix = (childIndex === 0 && i18nAttrValue) ? `:${i18nAttrValue.value}:` : '';

      if (types.namedTypes.JSXText.check(child)) {

        templateQuasis.push(types.builders.templateElement.from({
          value: {
            raw: translationMessagePrefix + child.value,
            cooked: translationMessagePrefix + child.value
          },
          tail: childIndex === i18nElement.children!.length - 1,
          loc: child.loc
        }));
        previousChildWasAnExpression = false;

      } else if (types.namedTypes.JSXExpressionContainer.check(child)) {
          
        if (childIndex === 0) {
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

        if (types.namedTypes.JSXEmptyExpression.check(child.expression)) {
          // if it's an empty expression, we don't need to do anything
        } else {

          if (previousChildWasAnExpression) {
            // insert an empty template element to separate the expressions
            templateQuasis.push(types.builders.templateElement.from({
              value: {
                raw: '',
                cooked: ''
              },
              tail: false
            }));
          }

          templateExpressions.push(child.expression);
          previousChildWasAnExpression = true;
        }

      } else if (types.namedTypes.JSXElement.check(child)) {
        childContainsElement = true;

        // TODO handle the element
      } else {
        throw new Error('Unexpected child type: ' + child.type + child.value);
      }
    });

    const $localizeExpression = types.builders.taggedTemplateExpression.from({
      tag: types.builders.identifier.from({ name: '$localize' }),
      quasi: types.builders.templateLiteral.from({
        expressions: templateExpressions,
        quasis: templateQuasis
      })
    });

    if (childContainsElement) {
      elementsContainElement = true;

      const $jsxifyExpression = types.builders.callExpression.from({
        callee: types.builders.identifier.from({ name: '$jsxify' }),
        arguments: [
          $localizeExpression
        ]
      });

      i18nElement.children = [types.builders.jsxExpressionContainer($jsxifyExpression)];

    } else {
      i18nElement.children = [types.builders.jsxExpressionContainer($localizeExpression)];
    }
  });

  return elementsContainElement;
}

function addJsxifyImport(rootNode: types.ASTNode) {
  const importDeclaration = types.builders.importDeclaration(
    [types.builders.importSpecifier.from({
      imported: types.builders.identifier.from({ name: '$jsxify' }),
      local: types.builders.identifier.from({ name: '$jsxify' })
    })],
    types.builders.literal.from({ value: 'jsx$localize/react' })
  );

  rootNode.unshift(importDeclaration);
}