import { Hono } from "hono";
import { KitHttpError, KitGeneralError } from "http-error-kit";
import {
    BAD_REQUEST,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR,
} from "http-response-status-code";
import {
    KitHonoMiddleware,
    KitHonoErrorHandler,
} from "../src";

describe("KitHonoMiddleware & KitHonoErrorHandler", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe("KitHonoErrorHandler", () => {
        it("should handle KitHttpError and return corresponding status code and json", async () => {
            const app = new Hono();
            app.onError(KitHonoErrorHandler());

            app.get("/test", () => {
                throw new KitHttpError(NOT_FOUND, "Resource Not Found", {
                    id: 123,
                });
            });

            const res = await app.request("/test");
            expect(res.status).toBe(NOT_FOUND);

            const body = await res.json();
            expect(body.statusCode).toBe(NOT_FOUND);
            expect(body.message).toBe("Resource Not Found");
            expect(body.details).toEqual({ id: 123 });
        });

        it("should handle KitGeneralError with fallback to 500 when status code is missing", async () => {
            const app = new Hono();
            app.onError(KitHonoErrorHandler());

            app.get("/general-error", () => {
                const generalError = new KitGeneralError(
                    INTERNAL_SERVER_ERROR,
                    "General failure"
                );
                (generalError as any).getInputs = () => null;
                throw generalError;
            });

            const res = await app.request("/general-error");
            expect(res.status).toBe(INTERNAL_SERVER_ERROR);

            const body = await res.json();
            expect(body.message).toBe("General failure");
        });

        it("should handle KitHttpError without toJSON method gracefully", async () => {
            const app = new Hono();
            app.onError(KitHonoErrorHandler());

            app.get("/no-tojson", () => {
                const error = new KitHttpError(BAD_REQUEST, "Bad Request");
                (error as any).toJSON = undefined;
                throw error;
            });

            const res = await app.request("/no-tojson");
            expect(res.status).toBe(BAD_REQUEST);
        });

        it("should log errors when log option is true", async () => {
            const app = new Hono();
            app.onError(KitHonoErrorHandler({ log: true }));

            app.get("/error", () => {
                throw new KitHttpError(BAD_REQUEST, "Invalid input");
            });

            const res = await app.request("/error");
            expect(res.status).toBe(BAD_REQUEST);
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        });

        it("should call custom log function when provided", async () => {
            const customLogger = jest.fn();
            const app = new Hono();
            app.onError(KitHonoErrorHandler({ log: customLogger }));

            app.get("/custom-log", () => {
                throw new KitHttpError(BAD_REQUEST, "Logged error");
            });

            const res = await app.request("/custom-log");
            expect(res.status).toBe(BAD_REQUEST);
            expect(customLogger).toHaveBeenCalledTimes(1);
            expect(customLogger.mock.calls[0][0]).toBeInstanceOf(KitHttpError);
        });

        it("should return structured 500 JSON when handleUnknownErrors is true", async () => {
            const app = new Hono();
            app.onError(KitHonoErrorHandler({ handleUnknownErrors: true }));

            app.get("/unknown", () => {
                throw new Error("Unexpected database crash");
            });

            const res = await app.request("/unknown");
            expect(res.status).toBe(INTERNAL_SERVER_ERROR);

            const body = await res.json();
            expect(body).toEqual({
                statusCode: INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        });

        it("should return plain text error message when handleUnknownErrors is false", async () => {
            const app = new Hono();
            app.onError(KitHonoErrorHandler({ handleUnknownErrors: false }));

            app.get("/standard-error", () => {
                throw new Error("Standard error message");
            });

            const res = await app.request("/standard-error");
            expect(res.status).toBe(INTERNAL_SERVER_ERROR);

            const text = await res.text();
            expect(text).toBe("Standard error message");
        });

        it("should handle non-Error thrown objects when handleUnknownErrors is false", () => {
            const handler = KitHonoErrorHandler();
            const mockContext: any = {
                text: jest.fn().mockReturnValue(new Response("Internal Server Error")),
            };

            const res = handler("Unexpected string exception" as any, mockContext);
            expect(mockContext.text).toHaveBeenCalledWith(
                "Internal Server Error",
                INTERNAL_SERVER_ERROR
            );
            expect(res).toBeInstanceOf(Response);
        });

        it("should safely fall back in catch block if context handling throws", () => {
            const handler = KitHonoErrorHandler();
            const mockContext: any = {
                json: jest.fn().mockImplementation(() => {
                    throw new Error("Failed to format json");
                }),
                text: jest.fn().mockReturnValue(new Response("Fallback")),
            };

            const result = handler(new KitHttpError(BAD_REQUEST, "Err"), mockContext);
            expect(mockContext.text).toHaveBeenCalledWith(
                "Internal Server Error",
                INTERNAL_SERVER_ERROR
            );
            expect(result).toBeInstanceOf(Response);
        });
    });

    describe("KitHonoMiddleware wrapper", () => {
        it("should register error handler on Hono app via onError", async () => {
            const app = new Hono();
            KitHonoMiddleware(app, { handleUnknownErrors: true });

            app.get("/middleware-test", () => {
                throw new KitHttpError(NOT_FOUND, "Item missing");
            });

            const res = await app.request("/middleware-test");
            expect(res.status).toBe(NOT_FOUND);

            const body = await res.json();
            expect(body.statusCode).toBe(NOT_FOUND);
            expect(body.message).toBe("Item missing");
        });
    });
});
