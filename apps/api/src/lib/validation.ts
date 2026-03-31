import type { Response } from "express";
import { z } from "zod";

export const parseOrRespond = <T extends z.ZodTypeAny>(
    schema: T,
    input: unknown,
    response: Response,
): z.infer<T> | null => {
    const result = schema.safeParse(input);
    if (!result.success) {
        response.status(400).json({
            message: "Donnees invalides.",
            issues: result.error.issues,
        });
        return null;
    }
    return result.data;
};
