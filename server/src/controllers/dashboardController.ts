import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalMacroscopy,
            totalFrascos,
            totalFragmentos,
            totalCassetes
        ] = await Promise.all([
            prisma.macroscopyRecord.count({
                where: {
                    created_at: {
                        gte: today
                    }
                }
            }),
            prisma.jar.count({
                where: {
                    created_at: {
                        gte: today
                    }
                }
            }),
            prisma.fragment.count({
                where: {
                    created_at: {
                        gte: today
                    }
                }
            }),
            prisma.cassette.count({
                where: {
                    created_at: {
                        gte: today
                    }
                }
            })
        ]);

        // Mammary Stats (Optional/TODO: Add when Mammary module is active or populated)

        res.json({
            macroscopy: totalMacroscopy,
            jars: totalFrascos,
            fragments: totalFragmentos,
            cassettes: totalCassetes
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const recent = await prisma.macroscopyRecord.findMany({
            take: 5,
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true,
                numero_guia: true,
                nome_paciente: true,
                status: true,
                created_at: true,
                total_frascos: true // Or count relations
            }
        });

        res.json(recent);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};
