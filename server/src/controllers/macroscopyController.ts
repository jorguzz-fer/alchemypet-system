import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const createMacroscopy = async (req: Request, res: Response) => {
    try {
        const { numero_guia, nome_paciente, jars, ...data } = req.body;

        if (!numero_guia || !nome_paciente) {
            return res.status(400).json({ error: 'Número da guia e Nome do paciente são obrigatórios' });
        }

        // Prepare Nested Jars Create Input
        let jarsCreateInput: any = undefined;

        if (jars && Array.isArray(jars) && jars.length > 0) {
            jarsCreateInput = {
                create: jars.map((jar: any) => {
                    // Prepare Fragments
                    const fragmentsCreate = jar.fragments && Array.isArray(jar.fragments) ? {
                        create: jar.fragments.map((frag: any, index: number) => {
                            // Prepare Cassettes
                            const cassettesCreate = frag.cassettes && Array.isArray(frag.cassettes) && frag.cassettes.length > 0 ? {
                                create: frag.cassettes.map((cas: any) => ({
                                    codigo: cas.codigo,
                                    numero_sequencial: cas.numero_sequencial || 1
                                }))
                            } : undefined;

                            return {
                                numero: frag.numero || (index + 1),
                                cor: Array.isArray(frag.cor) ? frag.cor : (frag.cor ? [frag.cor] : []),
                                consistencia: Array.isArray(frag.consistencia) ? frag.consistencia : (frag.consistencia ? [frag.consistencia] : []),
                                medidas: frag.medidas,
                                representacao: Array.isArray(frag.representacao) ? frag.representacao : (frag.representacao ? [frag.representacao] : []),
                                medidas_nodulo: frag.medidas_nodulo,
                                aspecto_nodulo: Array.isArray(frag.aspecto_nodulo) ? frag.aspecto_nodulo : (frag.aspecto_nodulo ? [frag.aspecto_nodulo] : []),
                                aparencia: Array.isArray(frag.aparencia) ? frag.aparencia : (frag.aparencia ? [frag.aparencia] : []),
                                caracteristicas: Array.isArray(frag.caracteristicas) ? frag.caracteristicas : (frag.caracteristicas ? [frag.caracteristicas] : []),
                                ...(cassettesCreate ? { cassettes: cassettesCreate } : {})
                            };
                        })
                    } : undefined;

                    return {
                        numero: String(jar.numero),
                        ...(fragmentsCreate ? { fragments: fragmentsCreate } : {})
                    };
                })
            };
        }

        // Clean data and ensure types
        const cleanData: any = { ...data };
        if (cleanData.total_frascos) cleanData.total_frascos = parseInt(cleanData.total_frascos);
        if (cleanData.total_fragmentos) cleanData.total_fragmentos = parseInt(cleanData.total_fragmentos);
        if (cleanData.total_cassetes) cleanData.total_cassetes = parseInt(cleanData.total_cassetes);

        const record = await prisma.macroscopyRecord.create({
            data: {
                numero_guia,
                nome_paciente,
                ...cleanData,
                ...(jarsCreateInput ? { jars: jarsCreateInput } : {})
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
        const { search, date } = req.query;

        const where: any = {};

        if (search) {
            where.OR = [
                { numero_guia: { contains: String(search) } }, // Remove mode: 'insensitive' for SQLite compatibility if needed, or keep if Postgres
                { nome_paciente: { contains: String(search) } }
            ];
        }

        if (date) {
            // date string format YYYY-MM-DD
            const startDate = new Date(String(date));
            const endDate = new Date(String(date));
            endDate.setDate(endDate.getDate() + 1);

            where.created_at = {
                gte: startDate,
                lt: endDate
            };
        }

        const records = await prisma.macroscopyRecord.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: 50,
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

        // If signing, update status to 'Assinado'
        if (updateData.is_signed === true) {
            updateData.status = 'Assinado';
            updateData.signed_at = new Date();
        }

        // Update Main Record
        const record = await prisma.macroscopyRecord.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Simplified Nested Update Logic:
        if (jars && Array.isArray(jars)) {
            for (const jar of jars) {
                let jarId = jar.id;

                // Handle Jar Creation or Update
                if (!jarId) {
                    const newJar = await prisma.jar.create({
                        data: {
                            registro_id: parseInt(id),
                            numero: String(jar.numero),
                            natureza: jar.natureza,
                            macroscopia: jar.macroscopia,
                            coloracao: jar.coloracao,
                            microscopia: jar.microscopia,
                            diagnostico: jar.diagnostico,
                            observacao: jar.observacao,
                            nota: jar.nota
                        }
                    });
                    jarId = newJar.id;
                } else {
                    // Update existing Jar analysis fields
                    await prisma.jar.update({
                        where: { id: jarId },
                        data: {
                            natureza: jar.natureza,
                            macroscopia: jar.macroscopia,
                            coloracao: jar.coloracao,
                            microscopia: jar.microscopia,
                            diagnostico: jar.diagnostico,
                            observacao: jar.observacao,
                            nota: jar.nota
                        }
                    });
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
                                    cor: Array.isArray(fragment.cor) ? fragment.cor : (fragment.cor ? [fragment.cor] : []),
                                    consistencia: Array.isArray(fragment.consistencia) ? fragment.consistencia : (fragment.consistencia ? [fragment.consistencia] : []),
                                    medidas: fragment.medidas,
                                    representacao: Array.isArray(fragment.representacao) ? fragment.representacao : (fragment.representacao ? [fragment.representacao] : []),
                                    medidas_nodulo: fragment.medidas_nodulo,
                                    aspecto_nodulo: Array.isArray(fragment.aspecto_nodulo) ? fragment.aspecto_nodulo : (fragment.aspecto_nodulo ? [fragment.aspecto_nodulo] : []),
                                    aparencia: Array.isArray(fragment.aparencia) ? fragment.aparencia : (fragment.aparencia ? [fragment.aparencia] : []),
                                    caracteristicas: Array.isArray(fragment.caracteristicas) ? fragment.caracteristicas : (fragment.caracteristicas ? [fragment.caracteristicas] : []),
                                    cassettes: cassettesCreateInput
                                }
                            });
                            fragmentId = newFrag.id;
                        } else {
                            // Update fragment
                            await prisma.fragment.update({
                                where: { id: fragmentId },
                                data: {
                                    cor: Array.isArray(fragment.cor) ? fragment.cor : (fragment.cor ? [fragment.cor] : []),
                                    consistencia: Array.isArray(fragment.consistencia) ? fragment.consistencia : (fragment.consistencia ? [fragment.consistencia] : []),
                                    medidas: fragment.medidas,
                                    representacao: Array.isArray(fragment.representacao) ? fragment.representacao : (fragment.representacao ? [fragment.representacao] : []),
                                    medidas_nodulo: fragment.medidas_nodulo,
                                    aspecto_nodulo: Array.isArray(fragment.aspecto_nodulo) ? fragment.aspecto_nodulo : (fragment.aspecto_nodulo ? [fragment.aspecto_nodulo] : []),
                                    aparencia: Array.isArray(fragment.aparencia) ? fragment.aparencia : (fragment.aparencia ? [fragment.aparencia] : []),
                                    caracteristicas: Array.isArray(fragment.caracteristicas) ? fragment.caracteristicas : (fragment.caracteristicas ? [fragment.caracteristicas] : [])
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
