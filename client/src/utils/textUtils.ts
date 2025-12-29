
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

    const receiptText = `Recebido ${numberToFullText(totalJars)} frasco(s) contendo ${numberToFullText(totalFragments)} fragmento(s) de material biológico.`;

    // Flatten cassettes for the list
    const cassetteList: any[] = [];
    record.jars?.forEach((jar: any) => {
        jar.fragments?.forEach((frag: any) => {
            if (frag.cassettes) {
                frag.cassettes.forEach((cas: any) => {
                    cassetteList.push({
                        codigo: cas.codigo,
                        text: `Acondicionado em cassete identificado como ${cas.codigo} e encaminhado para processamento histopatológico.`
                    });
                });
            }
        });
    });

    return {
        receiptText,
        cassetteList,
        summary: {
            jars: totalJars,
            fragments: totalFragments,
            cassettes: cassetteList.length
        }
    };
};
