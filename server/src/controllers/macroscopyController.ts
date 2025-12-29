import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const createMacroscopy = async (req: Request, res: Response) => {
    try {
        const { numero_guia, nome_paciente, ...data } = req.body;

        // Validate required fields
        if (!numero_guia || !nome_paciente) {
            return res.status(400).json({ error: 'Número da guia e Nome do paciente são obrigatórios' });
        }

        const record = await prisma.macroscopyRecord.create({
            data: {
                numero_guia,
                nome_paciente,
                ...data
            },
            include: {
                jars: {
                    include: {
                        fragments: {
                            include: {
                                cassettes: true
                            }
                        }
                    }
                },
                images: true
            }
        });

        res.status(201).json(record);
    } catch (error: any) {
        console.error('Error creating macroscopic record:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Número de guia já existe' });
        }
        res.status(500).json({ error: 'Falha ao criar registro' });
    }
};

export const listMacroscopies = async (req: Request, res: Response) => {
    try {
        const records = await prisma.macroscopyRecord.findMany({
            orderBy: { created_at: 'desc' },
            take: 50,
            include: {
                _count: {
                    select: { jars: true, images: true }
                }
            }
        });
        res.json(records);
    } catch (error) {
        console.error('Error listing records:', error);
        res.status(500).json({ error: 'Falha ao buscar registros' });
    }
};

export const getMacroscopyById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const record = await prisma.macroscopyRecord.findUnique({
            where: { id: parseInt(id) },
            include: {
                jars: {
                    orderBy: { numero: 'asc' },
                    include: {
                        fragments: {
                            orderBy: { numero: 'asc' },
                            include: {
                                cassettes: {
                                    orderBy: { numero_sequencial: 'asc' }
                                }
                            }
                        }
                    }
                },
                images: true
            }
        });

        if (!record) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.json(record);
    } catch (error) {
        console.error('Error getting record:', error);
        res.status(500).json({ error: 'Falha ao buscar registro' });
    }
};

// Add Jar to Record
export const addJar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { numero } = req.body;

        const jar = await prisma.jar.create({
            data: {
                registro_id: parseInt(id),
                numero: parseInt(numero)
            }
        });

        // Update counters
        await prisma.macroscopyRecord.update({
            where: { id: parseInt(id) },
            data: { total_frascos: { increment: 1 } }
        });

        res.status(201).json(jar);
    } catch (error) {
        console.error('Error adding jar:', error);
        res.status(500).json({ error: 'Falha ao adicionar frasco' });
    }
};

// Add Fragment to Jar
export const addFragment = async (req: Request, res: Response) => {
    try {
        const { jarId } = req.params;
        const { numero, ...data } = req.body;

        const fragment = await prisma.fragment.create({
            data: {
                frasco_id: parseInt(jarId),
                numero: parseInt(numero),
                ...data
            }
        });

        // Update counters (Requires finding the parent record first, doing simplified update for now)
        // In a real app we would traverse up or pass the record ID.
        // For now, let's rely on the record header update or separate transaction logic if needed strictly.
        // Actually, schema has counters on MacroscopyRecord. Let's find the parent.
        const jar = await prisma.jar.findUnique({
            where: { id: parseInt(jarId) },
            select: { registro_id: true }
        });

        if (jar) {
            await prisma.macroscopyRecord.update({
                where: { id: jar.registro_id },
                data: { total_fragmentos: { increment: 1 } }
            });
        }

        res.status(201).json(fragment);
    } catch (error) {
        console.error('Error adding fragment:', error);
        res.status(500).json({ error: 'Falha ao adicionar fragmento' });
    }
}
