import {jsx} from 'react/jsx-runtime';


export function $localizeJsx(strings: TemplateStringsArray, ...values: any[]): unknown[] | string {
  if (strings.length === 1 && values.length === 0) {
    return strings[0];
  }

  let identityLocalized: unknown[] = [];
  for (let i = 0; i < strings.length; i++) {
    identityLocalized.push(strings[i]);
    
    if (i < values.length) {
      let value = values[i];
      if (Array.isArray(value)) {
        identityLocalized.push(jsx(value[0], value[1]));
      } else {
        identityLocalized.push(value);
      }
      
    }
  }
  return identityLocalized;
}


/**
 * 
      <div i18n>
        s: Hello <b>{ 'George' }</b>! <span><i>{count}</i></span>
      </div>

      <div>
        p: { $localizeJsx`Hello ${['b', {children: 'George'}]}! ${['span', {children: [jsx('i', {children: count})]}]}` }
      </div>
      <div>
        p2: { $localizeJsx`Hello ${<b>{'George'}</b>}! ${<span><i>{count}</i></span>}` }
      </div>

      <div i18n>
        s2: Hello <b>{ 'George' }</b>! <span><i>Total count: {count}</i></span>
      </div>
      <div>
        p2: { $localizeJsx`Hello ${<b>{'George'}</b>}! ${<span><i>Total count: {count}</i></span>}` }
      </div>


      <div i18n>
        Hello { 'George' }! {count} <Greeting name="lalala">foo{count}bar</Greeting>
      </div>
      <div>
        { $localizeJsx`Hello ${ 'George' }! ${count} ${[Greeting, { name: "lalala", children: ['foo', count, 'bar'] }]}` }
      </div>
 */