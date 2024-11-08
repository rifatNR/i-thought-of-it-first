import { pool } from "@/database/db";
import { Router } from "express";

const router = Router();

router.get("/context", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contexts");
        console.log("Fetched:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({
            error,
            msg: "An error occurred while getting the context.",
        });
    }
});

router.post("/context/create", async (req, res) => {
    const { title, context, details, image } = req.body || {};

    const createdAt = new Date();
    const query = `
      INSERT INTO contexts (title, context, details, image, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    try {
        const result = await pool.query(query, [
            title,
            context,
            details || null,
            image || null,
            createdAt,
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error inserting context:", error);
        res.status(500).json({
            error,
            msg: "An error occurred while creating the context.",
        });
    }
});

export default router;
