import { Request, Response } from 'express';
import { categorizeInput } from '../services/openaiService';

export const categorize = async (req: Request, res: Response) => {
    try {
        const { input } = req.body;

        if (!input || typeof input !== 'string') {
            res.status(400).json({ error: "Input string is required" });
            return;
        }

        const result = await categorizeInput(input);
        res.json(result);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
