import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { loadTranslations } from '@angular/localize';

export const streamTimeout = 5_000;

export type I18nCatalog = {
  locale: 'en' | 'sk';
  translations: Record<string, string>;
};
const catalogImports = import.meta.glob<I18nCatalog>(
  '../messages-*.json',
);

export const handleError: HandleErrorFunction = (error, { request }) => {
  // React Router may abort some interrupted requests, don't log those
  if (!request.signal.aborted) {
    // make sure to still log the error so you can see it
    console.error('Were in the server', error);
  }
};

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
  // If you have middleware enabled:
  // loadContext: unstable_RouterContextProvider
) {
  // Load translations!
  // 
  // Usually we'd read the accept-language header to determine the locale
  // but in this demo we just pick locale based on which localized version of the app we run
  // This hack is mainly because react-router-server doesn't allow for assets directory to be configurable,
  // so we don't have an easy way in this demo to serve the localized assets without cloning the app
  // once for each locale
  // 
  // We also skip localization in dev mode and render the inlined original/fallback strings.
  if (!import.meta.env.DEV) {
    const translationCatalog = process.argv[2].includes("/sk/")
        ? await catalogImports[`../messages-sk.json`]()
        : catalogImports[`../messages-en.json`]();
    loadTranslations(translationCatalog.translations);
    console.log('loaded translation for locale:', translationCatalog.locale);
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";


    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000);
  });
}
