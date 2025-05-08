import {ɵ$localize as $localizeOriginal} from '@angular/localize';

/**
 * This override/patch for $localize is here to enable runtime localization support of $localize calls at the top level of a module.
 * 
 * Historically $localize didn't support this scenario which seems to be on oversight.
 * 
 * This patch is a workaround to enable this feature.
 */

// Extend the String class to pass instanceof check and inherit all String methods
class LocalizedString extends String {
  constructor(strings: TemplateStringsArray, ...values: unknown[]) {
    super('asdf');
    
    const localizedStringFn = () => $localizeOriginal(strings, ...values);

    // Override toString and valueOf to support string concatenation and stringification
    this.toString = localizedStringFn;
    this.valueOf = localizedStringFn;
  }
}

// @ts-ignore
globalThis.$localize = function $localizeDeferred(strings: TemplateStringsArray, ...values: unknown[]) {
  // This is a bit funky way to create the object, but we need to be able to override the length getter which is non-configurable on the String prototype
  return Object.create(new LocalizedString(strings, ...values), {
    length: {
      get() {
        return this.toString().length;
      }
    }
  });
}
