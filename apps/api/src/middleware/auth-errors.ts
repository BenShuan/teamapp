import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

export class UnauthorizedError extends HTTPException {
  constructor(message: string = "Unauthorized") {
    super(HttpStatusCodes.UNAUTHORIZED, { message });
  }
}

export class ForbiddenError extends HTTPException {
  constructor(message: string = "Forbidden") {
    super(HttpStatusCodes.FORBIDDEN, { message });
  }
}

export function createAuthErrorHandler() {
  return (err: Error, c: Context) => {
    console.error("Error:", err);

    if (err instanceof HTTPException) {
      const status = err.status;

      // Handle unauthorized (401)
      if (status === HttpStatusCodes.UNAUTHORIZED) {
        return c.json(
          {
            success: false,
            error: {
              message: err.message || HttpStatusPhrases.UNAUTHORIZED,
              code: "UNAUTHORIZED",
            },
          },
          HttpStatusCodes.UNAUTHORIZED,
        );
      }

      // Handle forbidden (403)
      if (status === HttpStatusCodes.FORBIDDEN) {
        return c.json(
          {
            success: false,
            error: {
              message: err.message || HttpStatusPhrases.FORBIDDEN,
              code: "FORBIDDEN",
            },
          },
          HttpStatusCodes.FORBIDDEN,
        );
      }

      // Let other HTTP exceptions pass through
      return c.json(
        {
          success: false,
          error: {
            message: err.message,
          },
        },
        status,
      );
    }

    // Generic server error
    return c.json(
      {
        success: false,
        error: {
          message: "Internal Server Error",
        },
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  };
}
