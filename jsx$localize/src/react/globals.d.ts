declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * `i18n` pseudo-element
       */
      'i18n': { meaning?: string; description?: string; id?: string, children: unknown };
    }
  }
}