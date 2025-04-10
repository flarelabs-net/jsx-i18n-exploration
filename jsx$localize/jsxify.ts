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

  for (const match of message.matchAll(/\uFFFD(?<closing>\/)?#(?<elementIndex>\d+)(?<selfClosing>\/)?\uFFFD/g)) {
  
    if (match.index! > consumedMessageIndex) {
      const text = message.slice(consumedMessageIndex, match.index!);
      nodeCursor.children.push(text);
    }
    consumedMessageIndex = match.index! + match[0].length;

    const {closing, elementIndex, selfClosing} = match.groups!;
    const opening = !closing;
    const element = elements[Number(elementIndex)];

    if (opening || selfClosing) {
      const newNode = {parent: nodeCursor, element, children: []}
      nodeCursor.children.push(newNode);
      if (!selfClosing) {
        nodeCursor = newNode;
      }
    } else {
      if (nodeCursor.parent === null || element !== nodeCursor.element) {
        throw new Error('Unbalanced closing tag')
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


// function that takes a string regexp delimiter and returns an array of all parts including all matched delimiters
// function splitByDelimiters(str: string, delimiter: RegExp) {
//   const parts = str.split(delimiter);
//   const delimiters = str.match(delimiter);
//   return parts.map((part, i) => i < parts.length - 1 ? [part, delimiters![i]] : [part]);
// }