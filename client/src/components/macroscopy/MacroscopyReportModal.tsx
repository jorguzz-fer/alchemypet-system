import React from 'react';
import { Copy, ArrowLeft } from 'lucide-react';
import { generateMacroscopyReport } from '../../utils/textUtils';
import api from '../../services/api';

interface MacroscopyReportModalProps {
    record: any;
    onClose: () => void;
}

const MacroscopyReportModal = ({ record, onClose }: MacroscopyReportModalProps) => {
    const report = generateMacroscopyReport(record);

    const handleCopy = () => {
        const fullText = `
**Guia: ${record.numero_guia}**
**Paciente: ${record.nome_paciente}**

RECEBIMENTO
${report.receiptText}

IDENTIFICAÇÃO E DESCRIÇÃO MACROSCÓPICA
${report.cassetteList.map(c => `
${c.codigo}
${c.text}
`).join('')}

RESUMO
Material processado: ${report.summary.fragments} fragmentos em ${report.summary.cassettes} cassetes
Total de frascos: ${report.summary.jars}
        `.trim();

        navigator.clipboard.writeText(fullText);
        alert('Relatório copiado para a área de transferência!');
    };

    const [aiReport, setAiReport] = React.useState<string | null>(null);
    const [loadingAi, setLoadingAi] = React.useState(false);

    const handleGenerateAi = async () => {
        setLoadingAi(true);
        try {
            const response = await api.post('/api/ai/generate-report', record);
            setAiReport(response.data.report);
        } catch (error) {
            console.error("Erro ao gerar relatório IA:", error);
            alert("Erro ao gerar relatório com IA.");
        } finally {
            setLoadingAi(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Análise de Macroscopia</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerateAi}
                            disabled={loadingAi}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {loadingAi ? 'Gerando...' : 'Gerar Análise (IA)'}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <Copy size={16} /> Copiar
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={16} /> Voltar
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">

                    {/* AI Report Section */}
                    {aiReport && (
                        <div className="bg-white border-l-4 border-purple-500 p-6 rounded shadow-sm mb-6">
                            <h3 className="text-purple-800 font-bold uppercase text-sm mb-4 flex items-center gap-2">
                                ✨ Análise Gerada por IA (Sugestão)
                            </h3>
                            <textarea
                                className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-purple-500 focus:border-purple-500"
                                value={aiReport}
                                onChange={(e) => setAiReport(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                * Edite o texto conforme necessário antes de copiar. Esta é uma sugestão baseada nos dados macroscópicos.
                            </p>
                        </div>
                    )}

                    {/* Identification Block */}
                    <div className="bg-gray-100 p-4 rounded-md mb-6">
                        <p className="font-bold text-gray-800 text-lg">**Guia: {record.numero_guia}**</p>
                        <p className="font-bold text-gray-800 text-lg mt-1">**Paciente: {record.nome_paciente}**</p>
                    </div>

                    {/* Receipt Block */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">RECEBIMENTO</h3>
                        <p className="text-gray-700 text-base">{report.receiptText}</p>
                    </div>

                    {/* Description Block */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">IDENTIFICAÇÃO E DESCRIÇÃO MACROSCÓPICA</h3>

                        <div className="space-y-4">
                            {report.cassetteList.map((item, index) => (
                                <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                                    <h4 className="font-bold text-blue-800 mb-1">{item.codigo}</h4>
                                    <p className="text-blue-900/80 italic text-sm">{item.text}</p>
                                </div>
                            ))}
                            {report.cassetteList.length === 0 && (
                                <p className="text-gray-400 italic">Nenhum cassete registrado.</p>
                            )}
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-8">
                        <h3 className="text-green-800 font-bold uppercase text-sm mb-2">RESUMO</h3>
                        <p className="text-green-900 font-medium">
                            Material processado: <span className="font-bold">{report.summary.fragments}</span> fragmentos em <span className="font-bold">{report.summary.cassettes}</span> cassetes
                        </p>
                        <p className="text-green-900 font-medium">
                            Total de frascos: <span className="font-bold">{report.summary.jars}</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MacroscopyReportModal;
