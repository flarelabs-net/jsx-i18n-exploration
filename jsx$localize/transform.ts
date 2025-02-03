import { parse, print, types } from "recast";
import { TransformResult } from "vite";

export function transform(code: string, moduleId: string): TransformResult {
  const ast = parse(code, {
    sourceFileName: moduleId
  });

  const [i18nElements, i18nAttrs] = findAndCleanupAllI18nElements(ast.program.body);

  rewriteI18nElements(i18nElements, i18nAttrs);

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
  i18nElements.forEach((element, index) => {

      let i18nAttr = i18nAttrs[index];
      let i18nAttrValue = i18nAttr.value;

      if (i18nAttrValue && !types.namedTypes.Literal.check(i18nAttrValue)) throw new Error('i18n attribute value must be a literal, was: ' + i18nAttrValue?.type);

      const templateExpressions: types.namedTypes.ExpressionStatement['expression'][] = [];
      const templateQuasis: types.namedTypes.TemplateElement[] = [];
      let lastChildWasAnExpression = false;

      element.children?.forEach((child, index) => {
        // The first one needs a special treatment
        if (index === 0) {
          
          // if it's a text and we have meaning or description then we need to add it to the template
          if (types.namedTypes.JSXText.check(child)) {
            templateQuasis.push(types.builders.templateElement.from({
              value: {
                raw: i18nAttrValue ? `:${i18nAttrValue.value}:${child.value}` : child.value, 
                cooked: i18nAttrValue ? `:${i18nAttrValue.value}:${child.value}` : child.value,
              },
              tail: element.children!.length === 1,
              loc: child.loc
            }));

          } else if (types.namedTypes.JSXExpressionContainer.check(child)) {
            
            // add an empty template element to the quasis since original element starts with an interpolation
            // but tagged templates always start with a string, even if it's an empty string
            templateQuasis.push(types.builders.templateElement.from({
              value: {
                raw: i18nAttrValue ? `:${i18nAttrValue.value}:` : '',
                cooked: i18nAttrValue ? `:${i18nAttrValue.value}:` : '',
              },
              tail: false
            }));

            if (types.namedTypes.JSXEmptyExpression.check(child.expression)) {
              // if it's an empty expression, we don't need to do anything
            } else {
              templateExpressions.push(child.expression);
              lastChildWasAnExpression = true;
            }
          } else {
            throw new Error('Unexpected child type: ' + child.type);
          }

          // we are done processing the first child, continue to the next one
          return;
        }

        if (types.namedTypes.JSXText.check(child)) {
          templateQuasis.push(types.builders.templateElement.from({
            value: {
              raw: child.value,
              cooked: child.value
            },
            tail: index === element.children!.length - 1,
            loc: child.loc
          }));
          lastChildWasAnExpression = false;
        } else if (types.namedTypes.JSXExpressionContainer.check(child)) {
          if (types.namedTypes.JSXEmptyExpression.check(child.expression)) {
            // ignore empty expressions
          } else {
            if (lastChildWasAnExpression) {
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
            lastChildWasAnExpression = true;
          }
        }
      });
      
      element.children = [types.builders.jsxExpressionContainer(
        types.builders.taggedTemplateExpression.from({
          tag: types.builders.identifier.from({ name: '$localize' }),
          quasi: types.builders.templateLiteral.from({
            expressions: templateExpressions,
            quasis: templateQuasis
          })
      }))];
  });
}