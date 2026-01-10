import { Request, Response } from 'express';
import prisma from '../prisma/client';

// Create Mammary Record
export const createMammary = async (req: Request, res: Response) => {
    try {
        const { numero_guia, nome_paciente, jars, cassettes, ...data } = req.body;

        if (!numero_guia || !nome_paciente) {
            return res.status(400).json({ error: 'Número da guia e Nome do paciente são obrigatórios' });
        }

        // Prepare nested Jars creation
        let jarsCreateInput = undefined;
        if (jars && Array.isArray(jars) && jars.length > 0) {
            jarsCreateInput = {
                create: jars.map((jar: any) => ({
                    numero: String(jar.numero),
                    conteudo: jar.conteudo,
                    dimensoes: jar.dimensoes,
                    fixador: jar.fixador || "Formol 10%"
                }))
            };
        }

        // Prepare nested Cassettes creation
        let cassettesCreateInput = undefined;
        if (cassettes && Array.isArray(cassettes) && cassettes.length > 0) {
            cassettesCreateInput = {
                create: cassettes.map((cassette: any) => ({
                    codigo: String(cassette.codigo),
                    numero_sequencial: parseInt(cassette.numero_sequencial) || 0
                }))
            };
        }

        // Clean numeric/decimal fields
        const cleanData: any = { ...data };
        if (cleanData.peso) cleanData.peso = parseFloat(cleanData.peso);
        if (cleanData.idade) cleanData.idade = parseInt(cleanData.idade);
        if (cleanData.quantidade_frascos) cleanData.quantidade_frascos = parseInt(cleanData.quantidade_frascos);
        if (cleanData.soma_blocos) cleanData.soma_blocos = parseInt(cleanData.soma_blocos);
        if (cleanData.data_coleta) cleanData.data_coleta = new Date(cleanData.data_coleta);

        const record = await prisma.mammaryRecord.create({
            data: {
                numero_guia,
                nome_paciente,
                ...cleanData,
                ...(jarsCreateInput ? { jars: jarsCreateInput } : {}),
                ...(cassettesCreateInput ? { cassettes: cassettesCreateInput } : {})
            },
            include: {
                jars: true,
                images: true,
                cassettes: true
            }
        });

        res.status(201).json(record);
    } catch (error: any) {
        console.error('Error creating mammary record:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Número de guia já existe' });
        }
        res.status(500).json({ error: `Falha ao criar registro: ${error.message}` });
    }
};

// List Mammary Records
export const listMammary = async (req: Request, res: Response) => {
    try {
        const { search, date } = req.query;
        const where: any = {};

        if (search) {
            where.OR = [
                { numero_guia: { contains: String(search) } },
                { nome_paciente: { contains: String(search) } }
            ];
        }

        if (date) {
            const startDate = new Date(String(date));
            const endDate = new Date(String(date));
            endDate.setDate(endDate.getDate() + 1);
            where.created_at = {
                gte: startDate,
                lt: endDate
            };
        }

        const records = await prisma.mammaryRecord.findMany({
            where,
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
        console.error('Error listing mammary records:', error);
        res.status(500).json({ error: 'Falha ao buscar registros' });
    }
};

// Get By ID
export const getMammaryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const record = await prisma.mammaryRecord.findUnique({
            where: { id: parseInt(id) },
            include: {
                jars: {
                    orderBy: { numero: 'asc' }
                },
                images: true,
                cassettes: {
                    orderBy: { numero_sequencial: 'asc' }
                }
            }
        });

        if (!record) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        res.json(record);
    } catch (error) {
        console.error('Error getting mammary record:', error);
        res.status(500).json({ error: 'Falha ao buscar registro' });
    }
};

// Update Mammary Record
export const updateMammary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { jars, cassettes, ...data } = req.body;

        // Sanitize
        const { id: _id, created_at, updated_at, ...updateData } = data;
        if (updateData.peso) updateData.peso = parseFloat(updateData.peso);
        if (updateData.idade) updateData.idade = parseInt(updateData.idade);
        if (updateData.quantidade_frascos) updateData.quantidade_frascos = parseInt(updateData.quantidade_frascos);
        if (updateData.soma_blocos) updateData.soma_blocos = parseInt(updateData.soma_blocos);
        if (updateData.data_coleta) updateData.data_coleta = new Date(updateData.data_coleta);

        // Update Main Record
        await prisma.mammaryRecord.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Handle Nested Jars
        if (jars && Array.isArray(jars)) {
            for (const jar of jars) {
                if (jar.id) {
                    await prisma.mammaryJar.update({
                        where: { id: jar.id },
                        data: {
                            numero: String(jar.numero),
                            conteudo: jar.conteudo,
                            dimensoes: jar.dimensoes,
                            fixador: jar.fixador
                        }
                    });
                } else {
                    await prisma.mammaryJar.create({
                        data: {
                            registro_id: parseInt(id),
                            numero: String(jar.numero),
                            conteudo: jar.conteudo,
                            dimensoes: jar.dimensoes,
                            fixador: jar.fixador
                        }
                    });
                }
            }
        }

        // Handle Nested Cassettes
        if (cassettes && Array.isArray(cassettes)) {
            // Get existing IDs to find deletions (optional, but good practice. For now simpler check)
            // Or just upsert/create based on ID presence
            const existingCassettes = await prisma.mammaryCassette.findMany({ where: { registro_id: parseInt(id) } });
            const incomingIds = cassettes.filter((c: any) => c.id).map((c: any) => c.id);
            const toDelete = existingCassettes.filter((c: any) => !incomingIds.includes(c.id));

            // Delete removed
            for (const c of toDelete) {
                await prisma.mammaryCassette.delete({ where: { id: c.id } });
            }

            for (const cassette of cassettes) {
                if (cassette.id) {
                    await prisma.mammaryCassette.update({
                        where: { id: cassette.id },
                        data: {
                            codigo: String(cassette.codigo),
                            numero_sequencial: parseInt(cassette.numero_sequencial) || 0
                        }
                    });
                } else {
                    await prisma.mammaryCassette.create({
                        data: {
                            registro_id: parseInt(id),
                            codigo: String(cassette.codigo),
                            numero_sequencial: parseInt(cassette.numero_sequencial) || 0
                        }
                    });
                }
            }
        }

        // Return full updated record
        const updatedRecord = await prisma.mammaryRecord.findUnique({
            where: { id: parseInt(id) },
            include: {
                jars: { orderBy: { numero: 'asc' } },
                images: true,
                cassettes: { orderBy: { numero_sequencial: 'asc' } },
            }
        });

        res.json(updatedRecord);
    } catch (error: any) {
        console.error('Error updating mammary record:', error);
        res.status(500).json({ error: `Falha ao atualizar registro: ${error.message}` });
    }
};

// Delete
export const deleteMammary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mammaryRecord.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting mammary record:', error);
        res.status(500).json({ error: 'Falha ao excluir registro' });
    }
};
