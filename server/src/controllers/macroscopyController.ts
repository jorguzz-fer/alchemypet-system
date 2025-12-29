import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const createMacroscopy = async (req: Request, res: Response) => {
    try {
        const { numero_guia, nome_paciente, jars, ...data } = req.body;

        if (!numero_guia || !nome_paciente) {
            return res.status(400).json({ error: 'Número da guia e Nome do paciente são obrigatórios' });
        }

        // Prepare Prisma Nested Write
        const jarsCreateInput = jars && Array.isArray(jars) ? {
            create: jars.map((jar: any) => ({
                numero: String(jar.numero), // Ensure String
                fragments: {
                    create: jar.fragments ? jar.fragments.map((frag: any, index: number) => ({
                        numero: frag.numero || (index + 1),
                        cor: frag.cor ? [frag.cor] : [],
                        consistencia: frag.consistencia ? [frag.consistencia] : [],
                        medidas: frag.medidas,
                        representacao: frag.representacao ? [frag.representacao] : [],
                        medidas_nodulo: frag.medidas_nodulo,
                        aspecto_nodulo: frag.aspecto_nodulo || [],
                        aparencia: frag.aparencia || [],
                        caracteristicas: [],
                    })) : []
                }
            }))
        } : undefined;

        const record = await prisma.macroscopyRecord.create({
            data: {
                numero_guia,
                nome_paciente,
                ...data, // status, etc
                jars: jarsCreateInput
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
        res.status(500).json({ error: `Falha ao criar registro: ${error.message}` });
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
                numero: String(numero) // Ensure String
            }
        });

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
};

// Update Macroscopy (Header and/or Nested data)
export const updateMacroscopy = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { jars, ...data } = req.body;

        // Sanitize payload: remove id, created_at, updated_at, and jars (already extracted)
        const { id: _id, created_at, updated_at, ...updateData } = data;

        // Update Main Record
        const record = await prisma.macroscopyRecord.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Simplified Nested Update Logic:
        if (jars && Array.isArray(jars)) {
            for (const jar of jars) {
                let jarId = jar.id;

                // If no ID, create Jar
                if (!jarId) {
                    const newJar = await prisma.jar.create({
                        data: {
                            registro_id: parseInt(id),
                            numero: String(jar.numero)
                        }
                    });
                    jarId = newJar.id;
                }

                // Handle Fragments
                if (jar.fragments) {
                    for (const fragment of jar.fragments) {
                        let fragmentId = fragment.id;

                        // Prepare Cassettes Create Input (for new fragments)
                        const cassettesCreateInput = fragment.cassettes && Array.isArray(fragment.cassettes) ? {
                            create: fragment.cassettes.map((cas: any) => ({
                                codigo: cas.codigo,
                                numero_sequencial: cas.numero_sequencial || 1
                            }))
                        } : undefined;

                        // If no ID, create fragment
                        if (!fragmentId) {
                            const newFrag = await prisma.fragment.create({
                                data: {
                                    frasco_id: jarId,
                                    numero: fragment.numero || 0,
                                    cor: fragment.cor ? [fragment.cor] : [],
                                    consistencia: fragment.consistencia ? [fragment.consistencia] : [],
                                    medidas: fragment.medidas,
                                    representacao: fragment.representacao ? [fragment.representacao] : [],
                                    medidas_nodulo: fragment.medidas_nodulo,
                                    aspecto_nodulo: fragment.aspecto_nodulo || [],
                                    aparencia: fragment.aparencia || [],
                                    caracteristicas: fragment.caracteristicas || [],
                                    cassettes: cassettesCreateInput
                                }
                            });
                            fragmentId = newFrag.id;
                        } else {
                            // Update fragment
                            await prisma.fragment.update({
                                where: { id: fragmentId },
                                data: {
                                    cor: fragment.cor ? (Array.isArray(fragment.cor) ? fragment.cor : [fragment.cor]) : [],
                                    consistencia: fragment.consistencia ? (Array.isArray(fragment.consistencia) ? fragment.consistencia : [fragment.consistencia]) : [],
                                    medidas: fragment.medidas,
                                    representacao: fragment.representacao ? (Array.isArray(fragment.representacao) ? fragment.representacao : [fragment.representacao]) : [],
                                    medidas_nodulo: fragment.medidas_nodulo,
                                    aspecto_nodulo: fragment.aspecto_nodulo || [],
                                    aparencia: fragment.aparencia || [],
                                    caracteristicas: fragment.caracteristicas || []
                                }
                            });
                        }

                        // Handle Cassettes for Existing/New Fragments (Upsert Logic)
                        if (fragment.cassettes && Array.isArray(fragment.cassettes)) {
                            for (const cassette of fragment.cassettes) {
                                if (cassette.id) {
                                    // Update existing cassette
                                    await prisma.cassette.update({
                                        where: { id: cassette.id },
                                        data: { codigo: cassette.codigo }
                                    });
                                } else if (fragmentId) { // Only create if we have a valid fragment parent ID
                                    // Create new cassette
                                    await prisma.cassette.create({
                                        data: {
                                            fragmento_id: fragmentId,
                                            codigo: cassette.codigo,
                                            numero_sequencial: cassette.numero_sequencial || 1
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        res.json(record);
    } catch (error: any) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: `Falha ao atualizar registro: ${error.message}` });
    }
};
