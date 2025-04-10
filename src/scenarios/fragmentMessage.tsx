/**
 * Fragments are not supported by recast and esprima OOB yet due to:
 * https://github.com/benjamn/recast/issues/1337
 *
 * This issue was fixed on the main branch and released as nightly:
 * https://github.com/jquery/esprima/pull/2046
 *
 * By setting up an override we can make it all work:
 * 
   "pnpm": {
    "overrides": {
      "esprima": "npm:nightly-esprima@2021.8.30" 
    }
  }
 */ 

export const fragmentMessage = (<><div i18n>Hello world!</div></>);
