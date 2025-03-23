import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, type z } from "zod";
import type ErrorResponse from "../interfaces/ErrorResponse";

export function notFound(req: Request, res: Response, next: NextFunction) {
	res.status(404);
	const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
	next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
	err: Error,
	req: Request,
	res: Response<ErrorResponse>,
	next: NextFunction,
) {
	console.log("error handler", err);
	const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
	res.status(statusCode);
	res.json({
		message: err.message,
		stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
	});
}

export function validateData(schema: z.ZodObject<any, any>) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((issue) => ({
					message: `${issue.path.join(".")} is ${issue.message}`,
				}));
				res
					.status(StatusCodes.BAD_REQUEST)
					.json({ error: "Invalid data", details: errorMessages });
			} else {
				res
					.status(StatusCodes.INTERNAL_SERVER_ERROR)
					.json({ error: "Internal Server Error" });
			}
		}
	};
}
