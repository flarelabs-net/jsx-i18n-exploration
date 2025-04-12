import { jsx, Fragment } from 'react/jsx-runtime';
import {cloneElement, ReactElement } from 'react';

interface JsxifyNode {
  parent: JsxifyNode | null;
  children: (JsxifyNode|string)[];
  element: ReactElement;
}


export function $jsxify(message:string, elements: ReactElement[]) {
  let rootNode: JsxifyNode = {parent: null, children: [], element: jsx(Fragment, {})};
  let nodeCursor = rootNode;
  let consumedMessageIndex = 0;
  const usedElements = new Set<ReactElement>();

  for (const match of message.matchAll(/\uFFFD(?<closing>\/)?#(?<elementIndex>\d+)(?<selfClosing>\/)?\uFFFD/g)) {
  
    if (match.index! > consumedMessageIndex) {
      const text = message.slice(consumedMessageIndex, match.index!);
      nodeCursor.children.push(text);
    }
    consumedMessageIndex = match.index! + match[0].length;

    const {closing, elementIndex: elementIndexString, selfClosing} = match.groups!;
    const opening = !closing;
    
    const elementIndex = Number(elementIndexString);
    if (elementIndex >= elements.length) {
      throw new Error(`Invalid translation: Element index ${elementIndex} out of bounds for elements array of length ${elements.length}.\nTranslation: ${message}`);
    }

    const element = elements[elementIndex];

    if (opening || selfClosing) {
      if (usedElements.has(element)) {
        throw new Error(`Invalid translation: Element #${elementIndex} (${JSON.stringify(element)}) has already been used.\nTranslation: ${message}`);
      }
      usedElements.add(element);

      const newNode = {parent: nodeCursor, element, children: []}
      nodeCursor.children.push(newNode);
      if (!selfClosing) {
        nodeCursor = newNode;
      }
    } else {
      if (nodeCursor.parent === null || element !== nodeCursor.element) {
        throw new Error(`Invalid translation: Element #${elementIndex} (${JSON.stringify(element)}) is being closed before opening.\nTranslation: ${message}`);
      };

      nodeCursor = nodeCursor.parent
    }
  };

  if (consumedMessageIndex < message.length) {
    const text = message.slice(consumedMessageIndex);
    nodeCursor.children.push(text);
  }

  return nodeToJsx(rootNode);
}

function nodeToJsx(node: JsxifyNode): ReactElement {
  const children = node.children.map(child => typeof child === 'string' ? child : nodeToJsx(child));
  return cloneElement(node.element, {}, ...children);
}
