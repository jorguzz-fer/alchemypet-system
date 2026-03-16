import { useState, useEffect } from 'react';
import { Copy, ArrowLeft, Mail, Share2, Check, FileCheck, CheckCircle2, Wand2 } from 'lucide-react';
import { generateMacroscopyReport } from '../../utils/textUtils';
import api from '../../services/api';

interface MacroscopyReportModalProps {
    record: any;
    onClose: () => void;
    onSaved?: () => void;
}

const MacroscopyReportModal = ({ record, onClose, onSaved }: MacroscopyReportModalProps) => {
    const report = generateMacroscopyReport(record);

    // State for editable report sections - prefer saved text from DB, fallback to generated
    const [macroscopyText, setMacroscopyText] = useState(record.macroscopy_text || report.macroscopyText);
    const [cassettesText, setCassettesText] = useState(record.cassettes_text || report.cassettesText);
    const [observacoesText, setObservacoesText] = useState(record.observacoes_text || report.observacoesText || '');

    // Per-jar AI reports (for coloração, observação, nota)
    const [aiReports, setAiReports] = useState<any[]>([]);
    const [loadingAiIndex, setLoadingAiIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    // Signature State
    const [signedBy, setSignedBy] = useState(record.signed_by || '');
    const [isSigned, setIsSigned] = useState(record.is_signed || false);
    const [isValidated, setIsValidated] = useState(record.is_validated || false);

    // Initialize AI Reports
    useEffect(() => {
        if (record && record.jars) {
            const mappedReports = record.jars.map((jar: any) => {
                // Gather observations from fragments if not present on the jar directly yet
                let initialObs = jar.observacao || '';
                if (!initialObs && jar.fragments && jar.fragments.length > 0) {
                    const fragObs = jar.fragments
                        .map((f: any, i: number) => f.observacoes ? `Fragmento ${i + 1}: ${f.observacoes}` : null)
                        .filter(Boolean)
                        .join('\n');
                    initialObs = fragObs;
                }

                return {
                    jar_id: jar.id,
                    jar_numero: jar.numero,
                    macroscopia: jar.macroscopia || '',
                    coloracao: jar.coloracao || '',
                    observacao: initialObs,
                    nota: jar.nota || '',
                    generated: !!(jar.macroscopia)
                };
            });
            setAiReports(mappedReports);
        }
    }, [record]);

    const handleGenerateSingle = async (index: number) => {
        setLoadingAiIndex(index);
        try {
            const targetJar = record.jars.find((j: any) => String(j.numero) === String(aiReports[index].jar_numero));
            if (!targetJar) {
                alert("Erro ao localizar dados do frasco.");
                return;
            }

            const payload = { ...record, jars: [targetJar] };
            const response = await api.post('/api/ai/generate-report', payload);
            const generatedReports = response.data.reports || [];

            if (generatedReports.length > 0) {
                const gen = generatedReports[0];
                const newReports = [...aiReports];
                newReports[index] = {
                    ...newReports[index],
                    macroscopia: gen.macroscopia || newReports[index].macroscopia,
                    observacao: gen.observacao || newReports[index].observacao,
                    nota: gen.nota || newReports[index].nota,
                    generated: true
                };
                setAiReports(newReports);
            }
        } catch (error) {
            console.error("Erro ao gerar relatório IA:", error);
            alert("Erro ao gerar relatório com IA.");
        } finally {
            setLoadingAiIndex(null);
        }
    };

    const handleSave = async (signed: boolean = false) => {
        setSaving(true);
        try {
            const payload = {
                is_validated: isValidated,
                is_signed: signed,
                signed_by: signedBy,
                signed_at: signed ? new Date().toISOString() : null,
                macroscopy_text: macroscopyText,
                cassettes_text: cassettesText,
                observacoes_text: observacoesText,
                jars: aiReports.map(report => ({
                    id: report.jar_id,
                    numero: report.jar_numero,
                    macroscopia: report.macroscopia,
                    coloracao: report.coloracao,
                    observacao: report.observacao,
                    nota: report.nota
                }))
            };

            const response = await api.put(`/api/macroscopy/${record.id}`, payload);
            const updatedRecord = response.data;

            // Update local record with saved data
            Object.assign(record, updatedRecord);

            if (signed) {
                alert('Análise assinada e salva com sucesso!');
                onSaved?.();
                onClose();
            } else {
                alert('Salvo com sucesso!');
                onSaved?.();
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar relatório.");
        } finally {
            setSaving(false);
        }
    };

    const updateReport = (index: number, field: string, value: string) => {
        const newReports = [...aiReports];
        newReports[index] = { ...newReports[index], [field]: value };
        setAiReports(newReports);
    };

    const handleCopy = () => {
        const fullText = `Guia: ${record.numero_guia}
Pacientes: ${record.nome_paciente}

MACROSCOPIA (Inclui Recebimento)

${macroscopyText}

CASSETES

${cassettesText}

OBSERVAÇÕES

${observacoesText}

RESUMO
Material processado: ${report.summary.fragments} fragmento(s) em ${report.summary.cassettes} cassete(s)
Total de frascos: ${report.summary.jars}`.trim();

        navigator.clipboard.writeText(fullText);
        alert('Relatório copiado para a área de transferência!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">

                {/* Header Actions */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-gray-800">Análise de Macroscopia</h2>
                    <div className="flex gap-2">
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
                <div className="p-8 overflow-y-auto bg-gray-50 flex-1">

                    {/* Report Sheet Header */}
                    <div className="mb-8 border-b-2 border-gray-800 pb-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Laudo Anatomopatológico</h1>
                                <p className="text-sm text-gray-500 mt-1">Serviço de Patologia Veterinária</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-gray-800 text-white px-3 py-1 text-sm font-bold inline-block mb-1">
                                    GUIA: {record.numero_guia}
                                </div>
                                <p className="text-sm font-bold text-gray-700">{record.nome_paciente}</p>
                            </div>
                        </div>
                    </div>

                    {/* RECEBIMENTO E MACROSCOPIA */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wider">Macroscopia (Inclui Recebimento)</h3>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descrição Completa</label>
                            <textarea
                                rows={12}
                                className="w-full text-sm text-gray-800 border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 font-mono leading-relaxed"
                                value={macroscopyText}
                                onChange={(e) => setMacroscopyText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* CASSETES */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wider">Cassetes</h3>
                        <textarea
                            rows={4}
                            className="w-full text-sm text-gray-800 border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            value={cassettesText}
                            onChange={(e) => setCassettesText(e.target.value)}
                        />
                    </div>

                    {/* OBSERVAÇÕES */}
                    {observacoesText !== undefined && (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 tracking-wider">Observações</h3>
                            <textarea
                                rows={4}
                                className="w-full text-sm text-gray-800 border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                value={observacoesText}
                                onChange={(e) => setObservacoesText(e.target.value)}
                                placeholder="Nenhuma observação informada."
                            />
                        </div>
                    )}

                    {/* Per-Jar AI Analysis (optional enhancement) */}
                    {aiReports.length > 0 && (
                        <div className="space-y-4 mb-8">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Análise por Frasco (IA)</h3>
                            {aiReports.map((aiReport, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                Frasco {aiReport.jar_numero}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleGenerateSingle(index)}
                                            disabled={loadingAiIndex === index}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Wand2 size={14} />
                                            {loadingAiIndex === index ? 'Gerando...' : aiReport.generated ? 'Regenerar IA' : 'Gerar com IA'}
                                        </button>
                                    </div>

                                    {aiReport.generated && (
                                        <div className="p-6 space-y-4 animate-in fade-in">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Macroscopia (IA):</label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full text-gray-800 border-gray-300 rounded focus:ring-purple-500"
                                                    value={aiReport.macroscopia || ''}
                                                    onChange={(e) => updateReport(index, 'macroscopia', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Coloração:</label>
                                                <input
                                                    className="w-full text-gray-800 border-gray-300 rounded focus:ring-purple-500"
                                                    value={aiReport.coloracao || ''}
                                                    onChange={(e) => updateReport(index, 'coloracao', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Observação:</label>
                                                    <textarea
                                                        className="w-full text-gray-600 border-gray-300 rounded text-xs"
                                                        rows={2}
                                                        value={aiReport.observacao || ''}
                                                        onChange={(e) => updateReport(index, 'observacao', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nota:</label>
                                                    <textarea
                                                        className="w-full text-gray-500 border-gray-300 rounded text-xs"
                                                        rows={2}
                                                        value={aiReport.nota || ''}
                                                        onChange={(e) => updateReport(index, 'nota', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Signature & Validation */}
                    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-6">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2">Validação e Assinatura</h4>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isValidated ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                                        {isValidated && <Check size={14} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isValidated} onChange={() => setIsValidated(!isValidated)} />
                                    <span className="text-sm font-medium text-gray-700">Validado</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSigned ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                                        {isSigned && <Check size={14} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isSigned} onChange={() => setIsSigned(!isSigned)} />
                                    <span className="text-sm font-medium text-gray-700">Assinado Eletronicamente</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {isSigned && (
                                    <input
                                        type="text"
                                        placeholder="Nome do Profissional"
                                        className="border-gray-300 rounded text-sm w-full md:w-48 animate-in fade-in"
                                        value={signedBy}
                                        onChange={(e) => setSignedBy(e.target.value)}
                                    />
                                )}
                                <button
                                    onClick={() => handleSave(false)}
                                    className="px-4 py-2 rounded text-sm font-medium transition-colors border bg-white text-gray-800 hover:bg-gray-50 border-gray-300"
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                    onClick={() => setIsValidated(!isValidated)}
                                    className={`px-4 py-2 rounded text-sm font-medium transition-colors border ${isValidated ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileCheck size={16} /> Validar
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setIsSigned(true); handleSave(true); }}
                                    disabled={saving}
                                    className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${isSigned ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                >
                                    <CheckCircle2 size={16} /> Assinar e Fechar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Share Footer */}
                    <div className="border-t border-gray-200 pt-6 flex justify-between items-center text-gray-500">
                        <span className="text-xs">Alchemypet System - v1.0</span>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider">Compartilhar:</span>
                            <button className="p-2 hover:bg-gray-100 rounded-full text-green-600 transition-colors" title="WhatsApp">
                                <Share2 size={20} />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors" title="E-mail">
                                <Mail size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroscopyReportModal;
