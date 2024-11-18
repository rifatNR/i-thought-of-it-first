import { router } from "@/trpc.mjs";
import { z } from "zod";
import { t } from "@/trpc.mjs";
import { Pool } from "pg";

const itemSchema = z.object({
    id: z.string(),
    userId: z.number(),
    title: z.string(),
    description: z.string(),
});
export const ideaRouter = router({
    get: t.procedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .output(z.object({ message: z.string(), data: itemSchema.optional() }))
        .query(async ({ ctx, input }) => {
            const { id } = input;

            try {
                const result = await ctx.psql.query(
                    `
                    SELECT id, userId, title, description
                    FROM ideas
                    WHERE id = $1;
                    `,
                    [id]
                );

                if (result.rows.length === 0) {
                    return { message: "Item not found." };
                }

                return {
                    message: "Item retrieved successfully.",
                    data: result.rows[0],
                };
            } catch (error) {
                console.error("Error retrieving item:", error);
                throw new Error("Failed to retrieve item.");
            }
        }),
    save: t.procedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().optional(),
                description: z.string().optional(),
            })
        )
        .output(z.object({ message: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id, title, description } = input;
            const userId = 1;

            try {
                await ctx.psql.query(
                    `
                    INSERT INTO ideas (id, userId, title, description)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (id)
                    DO UPDATE SET title = $3, description = $4;
                    `,
                    [id, userId, title, description]
                );

                return {
                    message: `Saved successfully.`,
                };
            } catch (error) {
                console.error("Error saving idea:", error);
                throw new Error("Failed to save idea.");
            }
        }),
    invite: t.procedure
        .input(
            z.object({
                id: z.string(),
                email: z.string().email(),
            })
        )
        .output(z.object({ message: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id: ideaId, email } = input;
            const userId = 1;

            try {
                await ctx.psql.query(
                    `
                    INSERT INTO participants (ideaId, userId, email)
                    VALUES ($1, $2, $3);
                    `,
                    [ideaId, userId, email]
                );

                return {
                    message: `Invited successfully.`,
                };
            } catch (error) {
                console.error("Error saving idea:", error);
                throw new Error("Failed to save idea.");
            }
        }),
});
