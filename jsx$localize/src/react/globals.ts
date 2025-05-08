declare module 'react' {
  interface HTMLAttributes<T> {
    /**
     * `i18n` pseudo-attribute
     */
    'i18n'?: string | boolean | undefined;

    /**
     * `i18n-<attr-name>` pseudo-attribute
     */
    [key: `i18n-${string}`]: string | boolean | undefined;
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * `i18n` pseudo-element
       */
      'i18n': { meaning?: string; description?: string; id?: string, children: unknown };
    }
  }
}