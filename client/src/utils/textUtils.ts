
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

export const generateMacroscopyReport = (record: any) => {
    const totalJars = record.jars?.length || 0;

    // Calculate total fragments
    let totalFragments = 0;
    record.jars?.forEach((jar: any) => {
        totalFragments += jar.fragments?.length || 0;
    });

    const receiptText = `Recebido(s) ${numberToFullText(totalJars)} frasco(s) contendo ${numberToFullText(totalFragments)} fragmento(s) de material biológico.`;

    // Flatten cassettes for the list, grouped by Jar if possible, or just list with Jar info
    const jarsWithCassettes: any[] = [];
    record.jars?.forEach((jar: any) => {
        const jarCassettes: any[] = [];
        jar.fragments?.forEach((frag: any, fIndex: number) => {
            if (frag.cassettes && frag.cassettes.length > 0) {
                const codes = frag.cassettes.map((c: any) => c.codigo).join(', ');
                const fragmentName = frag.nome || `Fragmento ${fIndex + 1}`;

                jarCassettes.push({
                    codigo: codes,
                    text: `O material do ${fragmentName} foi seccionado e acondicionado em cassete(s) identificado(s) como ${codes} e encaminhado para processamento histopatológico.`
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

    return {
        receiptText,
        jarsWithCassettes,
        summary: {
            jars: totalJars,
            fragments: totalFragments,
            cassettes: jarsWithCassettes.reduce((acc, j) => acc + j.cassettes.length, 0)
        }
    };
};
