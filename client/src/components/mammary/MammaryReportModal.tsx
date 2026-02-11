import { useState } from 'react';
import { Copy, ArrowLeft, CheckCircle2, Wand2 } from 'lucide-react';
import { generateMacroscopyReport } from '../../utils/textUtils';
import api from '../../services/api';

interface MammaryReportModalProps {
    record: any;
    onClose: () => void;
}

const MammaryReportModal = ({ record, onClose }: MammaryReportModalProps) => {
    // Generate report text from form parameters
    const report = generateMacroscopyReport(record);

    // Editable report sections
    const [receiptText, setReceiptText] = useState(report.receiptText);
    const [macroscopyText, setMacroscopyText] = useState(report.macroscopyText);
    const [cassettesText, setCassettesText] = useState(report.cassettesText);

    const [nota, setNota] = useState(record.nota || '');
    const [referencias, setReferencias] = useState(record.referencias || '');

    const [loadingAi, setLoadingAi] = useState(false);
    const [saving, setSaving] = useState(false);

    // Signature State
    const [signedBy, setSignedBy] = useState(record.signed_by || '');
    const [isSigned, setIsSigned] = useState(record.is_signed || false);
    const [isValidated, setIsValidated] = useState(record.is_validated || false);

    const handleGenerateAI = async () => {
        setLoadingAi(true);
        try {
            const response = await api.post('/api/ai/generate-mammary', record);
            const genReport = response.data.report;
            if (genReport) {
                if (genReport.aspecto_macroscopico) setMacroscopyText(genReport.aspecto_macroscopico);
                if (genReport.nota) setNota(genReport.nota);
                if (genReport.referencias) setReferencias(genReport.referencias);
            }
        } catch (error) {
            console.error("Erro ao gerar relatório IA:", error);
            alert("Erro ao gerar análise. Verifique o console.");
        } finally {
            setLoadingAi(false);
        }
    };

    const handleSave = async (signed: boolean = false) => {
        setSaving(true);
        try {
            // Store the combined text in aspecto_macroscopico
            const fullMacroscopy = `${receiptText}\n\n${macroscopyText}\n\nCASSETES:\n${cassettesText}`;

            const payload = {
                aspecto_macroscopico: fullMacroscopy,
                nota,
                referencias,
                is_validated: isValidated,
                is_signed: signed,
                signed_by: signedBy,
                signed_at: signed ? new Date().toISOString() : null
            };

            await api.put(`/api/mamaria/${record.id}`, payload);

            if (signed) {
                alert('Análise assinada e salva com sucesso!');
                onClose();
                window.location.reload();
            } else {
                alert('Salvo com sucesso!');
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar relatório.");
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = () => {
        const text = `Guia: ${record.numero_guia}
Paciente: ${record.nome_paciente}

RECEBIMENTO E MACROSCOPIA

${receiptText}

${macroscopyText}

CASSETES

${cassettesText}

NOTA:
${nota}

RESUMO
Material processado: ${report.summary.fragments} fragmento(s) em ${report.summary.cassettes} cassete(s)
Total de frascos: ${report.summary.jars}`.trim();
        navigator.clipboard.writeText(text);
        alert("Copiado!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Wand2 size={20} className="text-purple-600" />
                        Análise de Macroscopia Mamária
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handleCopy} className="bg-white border hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors">
                            <Copy size={16} />
                        </button>
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                            <ArrowLeft size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 bg-white">

                    {/* Header Info */}
                    <div className="mb-6 flex justify-between items-end border-b pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Laudo Mamário</h1>
                            <p className="text-gray-500">Exame: {record.numero_guia} | Paciente: {record.nome_paciente}</p>
                        </div>
                        <button
                            onClick={handleGenerateAI}
                            disabled={loadingAi}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            {loadingAi ? <span className="animate-spin">...</span> : <Wand2 size={20} />}
                            {loadingAi ? 'Gerando...' : 'Gerar com IA'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Recebimento */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Recebimento</label>
                            <textarea
                                className="w-full border-gray-300 rounded-md focus:ring-purple-500 min-h-[60px]"
                                value={receiptText}
                                onChange={(e) => setReceiptText(e.target.value)}
                            />
                        </div>

                        {/* Macroscopia */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição Macroscópica</label>
                            <textarea
                                className="w-full border-gray-300 rounded-md focus:ring-purple-500 min-h-[200px]"
                                value={macroscopyText}
                                onChange={(e) => setMacroscopyText(e.target.value)}
                            />
                        </div>

                        {/* Cassetes */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Cassetes</label>
                            <textarea
                                className="w-full border-gray-300 rounded-md focus:ring-purple-500 min-h-[100px]"
                                value={cassettesText}
                                onChange={(e) => setCassettesText(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nota</label>
                                <textarea
                                    className="w-full border-gray-300 rounded-md text-sm"
                                    rows={3}
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Referências</label>
                                <textarea
                                    className="w-full border-gray-300 rounded-md text-sm"
                                    rows={3}
                                    value={referencias}
                                    onChange={(e) => setReferencias(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Validation */}
                <div className="bg-gray-50 p-6 border-t border-gray-200 flex-shrink-0">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={isValidated} onChange={() => setIsValidated(!isValidated)} className="rounded text-green-600 focus:ring-green-500" />
                                <span className="font-medium text-gray-700">Validado</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={isSigned} onChange={() => setIsSigned(!isSigned)} className="rounded text-blue-600 focus:ring-blue-500" />
                                <span className="font-medium text-gray-700">Assinado Eletronicamente</span>
                            </label>

                            {isSigned && (
                                <input
                                    type="text"
                                    placeholder="Nome do Profissional"
                                    className="border-gray-300 rounded text-sm w-48 animate-in fade-in"
                                    value={signedBy}
                                    onChange={(e) => setSignedBy(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Salvar Rascunho
                            </button>
                            <button
                                onClick={() => { setIsSigned(true); handleSave(true); }}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} /> Salvar e Assinar
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MammaryReportModal;
