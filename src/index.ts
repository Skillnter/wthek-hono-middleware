import type { Context, ErrorHandler, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { KitHttpError, KitGeneralError } from "http-error-kit";
import {
  INTERNAL_SERVER_ERROR,
  getStatusDescription,
} from "http-response-status-code";

/**
 * Configuration options for KitHonoMiddleware and KitHonoErrorHandler.
 */
export interface IKitHonoMiddlewareOptions {
  /**
   * Optional logger callback or boolean flag.
   * When set to `true`, errors are logged via `console.error`.
   * When set to a function, the function receives the error and context
   * for custom logging (e.g. Pino, Winston).
   *
   * @default false
   */
  // eslint-disable-next-line no-unused-vars
  log?: boolean | ((error: unknown, c: Context) => void);

  /**
   * If true, catches non-Kit errors and returns a structured 500 JSON response
   * instead of passing raw error messages.
   *
   * @default false
   */
  handleUnknownErrors?: boolean;
}

/**
 * Returns a Hono error handler function for applications powered by `http-error-kit`.
 * The returned handler inspects errors and, if they are instances of `KitHttpError`
 * or `KitGeneralError`, sends a structured JSON response with the appropriate HTTP status code.
 * Unrecognised errors are either returned as a text error response or formatted as a structured
 * 500 JSON response when `handleUnknownErrors` is enabled.
 *
 * Use this when you need to pass the handler explicitly to `app.onError` or sub-routers.
 *
 * @param {IKitHonoMiddlewareOptions} [options] Optional configuration for the handler.
 * @returns {ErrorHandler} A Hono-compatible error handler function.
 *
 * @example
 * ```typescript
 * import { Hono } from "hono";
 * import { KitHonoErrorHandler } from "@wthek/hono-middleware";
 *
 * const app = new Hono();
 * app.onError(KitHonoErrorHandler({ log: true }));
 * ```
 */
export const KitHonoErrorHandler = (
  options?: IKitHonoMiddlewareOptions,
): ErrorHandler => {
  const { log = false, handleUnknownErrors = false } = options ?? {};

  return (error: unknown, c: Context) => {
    try {
      if (log) {
        if (typeof log === "function") {
          log(error, c);
        } else {
          console.error(error);
        }
      }

      if (error instanceof KitHttpError || error instanceof KitGeneralError) {
        // eslint-disable-next-line
        const statusCode = (error.getInputs()?.statusCode ??
          INTERNAL_SERVER_ERROR) as number;
        const payload =
          typeof error.toJSON === "function" ? error.toJSON() : error;
        return c.json(payload, statusCode as ContentfulStatusCode);
      }

      if (handleUnknownErrors) {
        return c.json(
          {
            message: getStatusDescription(INTERNAL_SERVER_ERROR),
            statusCode: INTERNAL_SERVER_ERROR as number,
          },
          INTERNAL_SERVER_ERROR as ContentfulStatusCode,
        );
      }

      const message =
        error instanceof Error
          ? error.message
          : getStatusDescription(INTERNAL_SERVER_ERROR);
      return c.text(message, INTERNAL_SERVER_ERROR as ContentfulStatusCode);
    } catch {
      return c.text(
        getStatusDescription(INTERNAL_SERVER_ERROR),
        INTERNAL_SERVER_ERROR as ContentfulStatusCode,
      );
    }
  };
};

/**
 * KitHonoMiddleware is a convenience wrapper that registers `KitHonoErrorHandler`
 * as the global error handler on the given Hono instance via `app.onError`.
 *
 * @param {Hono} app The Hono application instance.
 * @param {IKitHonoMiddlewareOptions} [options] Optional configuration for the middleware.
 *
 * @example
 * ```typescript
 * import { Hono } from "hono";
 * import { KitHonoMiddleware } from "@wthek/hono-middleware";
 *
 * const app = new Hono();
 * KitHonoMiddleware(app, { log: true, handleUnknownErrors: true });
 * ```
 */
export const KitHonoMiddleware = (
  app: Hono,
  options?: IKitHonoMiddlewareOptions,
): void => {
  app.onError(KitHonoErrorHandler(options));
};
