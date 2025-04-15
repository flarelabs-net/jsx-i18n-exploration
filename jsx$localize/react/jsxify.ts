import { jsx, Fragment } from 'react/jsx-runtime';
import {cloneElement, ReactElement } from 'react';

interface JsxifyNode {
  parent: JsxifyNode | null;
  children: (JsxifyNode|string)[];
  element: ReactElement;
}


export function $jsxify(message:string, expressions: unknown[]) {
  let rootNode: JsxifyNode = {parent: null, children: [], element: jsx(Fragment, {})};
  let nodeCursor = rootNode;
  let consumedMessageIndex = 0;
  const usedExpressions = new Set<number>();

  for (const match of message.matchAll(/\uFFFD(?<closing>\/)?#(?<expressionIndex>\d+)(?<selfClosing>\/)?\uFFFD/g)) {
  
  if (match.index! > consumedMessageIndex) {
      const text = message.slice(consumedMessageIndex, match.index!);
      nodeCursor.children.push(text);
    }
    consumedMessageIndex = match.index! + match[0].length;

    const {closing, expressionIndex: expressionIndexString, selfClosing} = match.groups!;
    const opening = !closing;
    
    const expressionIndex = Number(expressionIndexString);
    if (expressionIndex >= expressions.length) {
      throw new Error(`Invalid translation: Element index ${expressionIndex} out of bounds for elements array of length ${expressions.length}.\nTranslation: ${message}`);
    }

    const expressionResult = expressions[expressionIndex];
    
    if (opening || selfClosing) {
      if (usedExpressions.has(expressionIndex)) {
        throw new Error(`Invalid translation: Element #${expressionIndex} (${JSON.stringify(expressionResult)}) has already been used.\nTranslation: ${message}`);
      }
      usedExpressions.add(expressionIndex);
      
      
      if (isReactElement(expressionResult)) {
        const newNode = {parent: nodeCursor, element: expressionResult, children: []}
        nodeCursor.children.push(newNode);
        if (!selfClosing) {
          nodeCursor = newNode;
        }
      } else {
        nodeCursor.children.push(expressionResult);
      }
      

      
    } else {
      if (nodeCursor.parent === null || expressionResult !== nodeCursor.element) {
        throw new Error(`Invalid translation: Element #${expressionIndex} (${JSON.stringify(expressionResult)}) is being closed before opening.\nTranslation: ${message}`);
      };

      nodeCursor = nodeCursor.parent
    }
  };

  if (consumedMessageIndex < message.length) {
    const text = message.slice(consumedMessageIndex);
    nodeCursor.children.push(text);
  }

  return jsxifyNodeToJsxElement(rootNode);
}

function jsxifyNodeToJsxElement(node: JsxifyNode): ReactElement {
  const children = node.children.map(child => isReactElement(child.element) ? jsxifyNodeToJsxElement(child) : child);
  return cloneElement(node.element, {}, ...children);
}

function isReactElement(value: unknown): value is ReactElement {
  return typeof value === 'object' && value !== null && (value as any).$$typeof === Symbol.for("react.transitional.element");
}