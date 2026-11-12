# Official @wthek Extension – Hono Middleware for `http-error-kit`

**Seamless Hono Error Handling with @wthek**

_Built for applications powered by [http-error-kit][http-error-kit], this middleware ensures that all `http-error-kit` errors are properly formatted and returned with the correct HTTP status codes in Hono._

> 💡 What the HEK?! Need a hassle-free way to manage error responses for `http-error-kit` errors in Hono? `@wthek/hono-middleware` has got you covered!

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/skillnter/wthek-hono-middleware/main.yml)
[![npm version](https://img.shields.io/npm/v/%40wthek%2Fhono-middleware?color=brightgreen)](https://www.npmjs.com/package/@wthek/hono-middleware)
[![GitHub license](https://img.shields.io/github/license/skillnter/wthek-hono-middleware?color=brightgreen)](LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/Skillnter/wthek-hono-middleware)](https://github.com/Skillnter/wthek-hono-middleware/issues)
![npm](https://img.shields.io/npm/dy/%40wthek%2Fhono-middleware)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40wthek%2Fhono-middleware)](https://bundlephobia.com/package/%40wthek%2Fhono-middleware)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/453f3cdfa02749c9b4c506dbbf5e103a)](https://app.codacy.com/gh/Skillnter/wthek-hono-middleware/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/453f3cdfa02749c9b4c506dbbf5e103a)](https://app.codacy.com/gh/Skillnter/wthek-hono-middleware/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@wthek/hono-middleware/1.0.0)](https://socket.dev/npm/package/@wthek/hono-middleware/overview/1.0.0)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white)](https://skillnter.github.io/wthek-hono-middleware/)
[![Github Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-30363D?&logo=GitHub-Sponsors&logoColor=EA4AAA)](https://github.com/sponsors/Skillnter)
[![Open Collective](https://img.shields.io/badge/Open%20Collective-3385FF?logo=open-collective&logoColor=white)](https://opencollective.com/skillnter)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/skillnter)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/skillnter)
[![PayPal](https://img.shields.io/badge/PayPal-003087?logo=paypal&logoColor=fff)](https://www.paypal.me/skillnte)

## Features

-   **Official `http-error-kit` Extension** – The recommended error-handling middleware for Hono apps.
-   **Auto-sets HTTP status codes** – Ensures the response status matches the error type.
-   **Plug-and-Play Middleware** – Register via `KitHonoMiddleware(app)` or `app.onError(KitHonoErrorHandler())`.
-   **Graceful Fallbacks** – Returns clean error responses for non-Kit errors.
-   **Configurable Logging** – Enable console logging or provide your own logger callback (Pino, Winston).
-   **`handleUnknownErrors` Option** – Optionally catch non-Kit errors and return a structured 500 JSON response.
-   **Multi-Runtime Support** – Works seamlessly across Node.js, Cloudflare Workers, Deno, and Bun.

## Table of Content

-   [Installation](#installation)
-   [Usage](#usage)
-   [Options](#options)
-   [Explore More WTHek Extensions](#explore-more-wthek-extensions)
-   [People](#people)
-   [Donations](#donations)
-   [License](#license)

## Installation

```console
npm install @wthek/hono-middleware
```

## Usage

### 1. Global Setup (`KitHonoMiddleware`)

```typescript
import { Hono } from "hono";
import { KitHonoMiddleware } from "@wthek/hono-middleware";
import { KitHttpError } from "http-error-kit";
import { NOT_FOUND } from "http-response-status-code";

const app = new Hono();

app.get("/users/:id", (c) => {
    throw new KitHttpError(NOT_FOUND, "User Not Found", { id: c.req.param("id") });
});

// Register global error handler
KitHonoMiddleware(app, {
    log: true,
    handleUnknownErrors: true,
});

export default app;
```

### 2. Standalone Handler (`KitHonoErrorHandler`)

```typescript
import { Hono } from "hono";
import { KitHonoErrorHandler } from "@wthek/hono-middleware";

const app = new Hono();

app.onError(
    KitHonoErrorHandler({
        log: (err, c) => console.error(`Error on ${c.req.method} ${c.req.path}:`, err),
        handleUnknownErrors: true,
    })
);
```

## Options

| Option                | Type                                                    | Default | Description                                                                                          |
| --------------------- | ------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `log`                 | `boolean \| ((error: unknown, c: Context) => void)`    | `false` | When `true`, logs via `console.error`. When a function is provided, receives `(error, c)` for custom logging. |
| `handleUnknownErrors` | `boolean`                                               | `false` | When `true`, non-Kit errors return a structured 500 JSON response instead of plain text.            |

### Custom Formatting with `KitHttpErrorConfig`

```typescript
import { KitHttpErrorConfig } from "http-error-kit";

KitHttpErrorConfig.configureFormatter(
    (statusCode, message, details, ...args) => ({
        status: statusCode,
        error: message,
        details,
        timestamp: new Date().toISOString(),
    })
);
```

## Explore More WTHek Extensions

The WTHek ecosystem continues to grow with new extensions to simplify error handling across various frameworks and libraries. Stay updated with the latest tools that integrate seamlessly with `http-error-kit`.

**Check out the official list of extensions**: [Official Extensions List](https://github.com/Skillnter/http-error-kit/wiki/Official-Extensions-List)

## People

The original author of the project is [Himanshu Bansal][skillnter]

## Donations

**This is all voluntary work**, so if you want to support my efforts you can

-   [Buy Me A Coffee](https://www.buymeacoffee.com/skillnter)
-   [Paypal](https://www.paypal.me/skillnte)
-   [GitHub Sponsor](https://github.com/sponsors/Skillnter)
-   [Patreon](https://www.patreon.com/skillnter)
-   [Open Collective](https://opencollective.com/skillnter)

You can also use the following:

![BNB: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/BNB-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

![BTC: bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf](https://img.shields.io/badge/BTC-bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf-brightgreen)

![ETH: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/ETH-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

## License

`@wthek/hono-middleware` project is open-sourced software licensed under the [MIT license](LICENSE) by [Himanshu Bansal][skillnter].

[skillnter]: https://github.com/Skillnter/
[http-error-kit]: https://www.npmjs.com/package/http-error-kit

