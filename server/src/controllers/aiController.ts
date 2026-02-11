import { Request, Response } from 'express';
import { categorizeInput, generateMacroscopyAnalysis, generateMammaryAnalysis } from '../services/openaiService';

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

export const generateReport = async (req: Request, res: Response) => {
    try {
        const record = req.body;
        if (!record) {
            res.status(400).json({ error: "Record data is required" });
            return;
        }

        const reports = await generateMacroscopyAnalysis(record);
        res.json({ reports });
    } catch (error: any) {
        console.error("Report Generation Error:", error);
        const message = error?.message || "Internal Server Error";
        res.status(500).json({ error: message });
    }
};

export const generateMammary = async (req: Request, res: Response) => {
    try {
        const record = req.body;
        if (!record) {
            res.status(400).json({ error: "Record data is required" });
            return;
        }

        const report = await generateMammaryAnalysis(record);
        res.json({ report });
    } catch (error: any) {
        console.error("Mammary Report Generation Error:", error);
        const message = error?.message || "Internal Server Error";
        res.status(500).json({ error: message });
    }
};
