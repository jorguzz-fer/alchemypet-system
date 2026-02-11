
export const numberToFullText = (num: number): string => {
    const map: { [key: number]: string } = {
        0: 'zero', 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco',
        6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
        11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze',
        16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove', 20: 'vinte'
    };

    if (map[num]) return `${map[num]} (${num})`;
    return String(num); // Fallback for larger numbers
};

/**
 * Builds a descriptive macroscopy text for a single fragment based on its selected parameters.
 */
const buildFragmentDescription = (fragment: any, _fragmentLabel: string): string => {
    const parts: string[] = [];

    // Characteristics (tissue type)
    const caracteristicas = fragment.caracteristicas || [];
    if (caracteristicas.length > 0) {
        parts.push(`Fragmento de tecido ${caracteristicas.map((c: string) => c.toLowerCase()).join(', ')}`);
    } else {
        parts.push('Fragmento de tecido');
    }

    // Appearance
    const aparencia = fragment.aparencia || [];
    if (aparencia.length > 0) {
        parts.push(aparencia.map((a: string) => a.toLowerCase()).join(', '));
    }

    // Fragment measurements
    if (fragment.medidas) {
        parts.push(`medindo ${fragment.medidas}`);
    }

    // Build the main sentence
    let text = parts.join(', ') + '.';

    // Nodule description (if any nodule data exists)
    const hasNodule = fragment.medidas_nodulo ||
        (fragment.aspecto_nodulo && fragment.aspecto_nodulo.length > 0) ||
        (fragment.consistencia && fragment.consistencia.length > 0) ||
        (fragment.cor && fragment.cor.length > 0);

    if (hasNodule) {
        const noduleParts: string[] = [];

        // Consistency
        const consistencia = fragment.consistencia || [];
        if (consistencia.length > 0) {
            noduleParts.push(`consistência ${consistencia.map((c: string) => c.toLowerCase()).join(' e ')}`);
        }

        // Aspect at cut
        const aspecto = fragment.aspecto_nodulo || [];
        if (aspecto.length > 0) {
            noduleParts.push(aspecto.map((a: string) => a.toLowerCase()).join(', '));
        }

        // Color
        const cor = fragment.cor || [];
        if (cor.length > 0) {
            noduleParts.push(`de coloração ${cor.map((c: string) => c.toLowerCase()).join(' e ')}`);
        }

        // Nodule measurements
        if (fragment.medidas_nodulo) {
            noduleParts.push(`medindo ${fragment.medidas_nodulo}`);
        }

        if (noduleParts.length > 0) {
            text += ` Ao corte, nódulo de ${noduleParts.join(', ')}.`;
        }
    }

    // Representation
    const representacao = fragment.representacao || [];
    if (representacao.length > 0) {
        text += ` Representação: ${representacao.join(', ').toLowerCase()}.`;
    }

    return text;
};

/**
 * Generates the full macroscopy report text from record data.
 * Works for both general macroscopy and mammary records.
 */
export const generateMacroscopyReport = (record: any) => {
    const jars = record.jars || [];
    const totalJars = jars.length;

    // Calculate total fragments
    let totalFragments = 0;
    jars.forEach((jar: any) => {
        totalFragments += jar.fragments?.length || 0;
    });

    // RECEBIMENTO
    const receiptText = `Recebido(s) ${numberToFullText(totalJars)} frasco(s) contendo ${numberToFullText(totalFragments)} fragmento(s) de material biológico.`;

    // MACROSCOPIA - Build descriptive text per jar/fragment
    const macroscopyParts: string[] = [];
    const jarsWithCassettes: any[] = [];

    jars.forEach((jar: any) => {
        const fragments = jar.fragments || [];
        const jarCassettes: any[] = [];

        fragments.forEach((frag: any, fIndex: number) => {
            const fragLabel = `Fragmento ${fIndex + 1}`;
            const description = buildFragmentDescription(frag, fragLabel);

            if (totalJars > 1) {
                macroscopyParts.push(`Frasco ${jar.numero}, ${fragLabel}: ${description}`);
            } else {
                macroscopyParts.push(`${fragLabel}: ${description}`);
            }

            // Cassettes for this fragment
            if (frag.cassettes && frag.cassettes.length > 0) {
                const codes = frag.cassettes.map((c: any) => c.codigo).join(', ');
                jarCassettes.push({
                    codigo: codes,
                    text: `O material do ${fragLabel} foi seccionado e acondicionado em cassete(s) identificado(s) como ${codes} e encaminhado para processamento histopatológico.`
                });
            }
        });

        if (jarCassettes.length > 0) {
            jarsWithCassettes.push({
                jarNumero: jar.numero,
                cassettes: jarCassettes
            });
        }
    });

    const macroscopyText = macroscopyParts.join('\n');

    // CASSETES text
    const cassettesText = jarsWithCassettes.map((jarData: any) => {
        return jarData.cassettes.map((c: any) => c.text).join('\n');
    }).join('\n');

    return {
        receiptText,
        macroscopyText,
        cassettesText,
        jarsWithCassettes,
        summary: {
            jars: totalJars,
            fragments: totalFragments,
            cassettes: jarsWithCassettes.reduce((acc: number, j: any) => acc + j.cassettes.length, 0)
        }
    };
};
