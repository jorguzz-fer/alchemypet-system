import { useState } from 'react';
import { Plus, Save, Loader2, FlaskConical, Wand2, TestTube, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import MammaryFragmentSection from './MammaryFragmentSection';
import MammaryReportModal from './MammaryReportModal';

interface MammaryFormData {
    id?: number;
    numero_guia: string;
    nome_paciente: string;
    status: string;
    jars: any[];
    cassettes: any[];
}

interface MammaryFormProps {
    onSaveSuccess?: (record?: any) => void;
}

const createEmptyFragment = (numero: number) => ({
    numero,
    caracteristicas: [],
    aparencia: [],
    consistencia: [],
    aspecto_nodulo: [],
    cor: [],
    representacao: [],
    medidas: '',
    medidas_nodulo: '',
    observacoes: '',
    cassettes: []
});

const MammaryForm = ({ onSaveSuccess }: MammaryFormProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [savedRecord, setSavedRecord] = useState<any>(null);

    const [formData, setFormData] = useState<MammaryFormData>({
        numero_guia: '',
        nome_paciente: '',
        status: 'em_analise',
        jars: [{
            numero: '1',
            fragments: [createEmptyFragment(1)]
        }],
        cassettes: []
    });

    // --- Jar Management ---
    const addJar = () => {
        setFormData({
            ...formData,
            jars: [
                ...formData.jars,
                { numero: String(formData.jars.length + 1), fragments: [] }
            ]
        });
    };

    const updateJar = (index: number, jarData: any) => {
        const newJars = [...formData.jars];
        newJars[index] = jarData;
        setFormData({ ...formData, jars: newJars });
    };

    const removeJar = (index: number) => {
        const newJars = formData.jars.filter((_: any, i: number) => i !== index);
        const reindexed = newJars.map((jar: any, i: number) => ({ ...jar, numero: String(i + 1) }));
        setFormData({ ...formData, jars: reindexed });
    };

    // --- Fragment Management within Jar ---
    const handleFragmentCountChange = (jarIndex: number, value: string) => {
        const count = parseInt(value);
        if (isNaN(count) || count < 0 || count > 10) return;

        const jar = formData.jars[jarIndex];
        const currentFragments = jar.fragments || [];
        let newFragments = [...currentFragments];

        if (count > currentFragments.length) {
            for (let i = currentFragments.length; i < count; i++) {
                newFragments.push(createEmptyFragment(i + 1));
            }
        } else {
            newFragments = newFragments.slice(0, count);
        }

        updateJar(jarIndex, { ...jar, fragments: newFragments });
    };

    const updateFragment = (jarIndex: number, fragIndex: number, fragData: any) => {
        const jar = formData.jars[jarIndex];
        const newFragments = [...jar.fragments];
        newFragments[fragIndex] = fragData;
        updateJar(jarIndex, { ...jar, fragments: newFragments });
    };

    const removeFragment = (jarIndex: number, fragIndex: number) => {
        const jar = formData.jars[jarIndex];
        const newFragments = jar.fragments.filter((_: any, i: number) => i !== fragIndex);
        const reindexed = newFragments.map((f: any, i: number) => ({ ...f, numero: i + 1 }));
        updateJar(jarIndex, { ...jar, fragments: reindexed });
    };

    // --- Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            // Prepare payload: serialize fragments into jar conteudo as JSON
            const payload = {
                numero_guia: formData.numero_guia,
                nome_paciente: formData.nome_paciente,
                status: formData.status,
                quantidade_frascos: formData.jars.length,
                jars: formData.jars.map((jar: any) => ({
                    ...(jar.id ? { id: jar.id } : {}),
                    numero: jar.numero,
                    conteudo: JSON.stringify(jar.fragments || []),
                    dimensoes: '',
                    fixador: 'Formol 10%'
                })),
                // Flatten all cassettes from all fragments for record-level storage
                cassettes: formData.jars.flatMap((jar: any) =>
                    (jar.fragments || []).flatMap((frag: any) =>
                        (frag.cassettes || []).map((c: any) => ({
                            ...(c.id ? { id: c.id } : {}),
                            codigo: c.codigo,
                            numero_sequencial: c.numero_sequencial || 0
                        }))
                    )
                )
            };

            let result: any;
            if (formData.id) {
                const response = await api.put(`/api/mamaria/${formData.id}`, payload);
                result = response.data;
            } else {
                const response = await api.post('/api/mamaria', payload);
                result = response.data;
                setFormData(prev => ({ ...prev, id: result.id }));
            }

            setSuccess(true);
            // Store the full form data for the report modal (with fragments)
            setSavedRecord({ ...formData, id: result.id || formData.id });

            setTimeout(() => {
                setShowReportModal(true);
            }, 100);

            if (onSaveSuccess) onSaveSuccess();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error('Error saving mammary record:', error);
            const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
            alert(`Erro ao salvar: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Mock Data ---
    const fillWithMockData = () => {
        const randomId = Math.floor(Math.random() * 10000);
        setFormData({
            ...formData,
            numero_guia: `${randomId}`,
            nome_paciente: 'Bolinha',
            jars: [
                {
                    numero: '1',
                    fragments: [
                        {
                            numero: 1,
                            caracteristicas: ['Cutâneo'],
                            aparencia: ['Elevado/Séssil', 'Ulcerado'],
                            consistencia: ['Firme'],
                            aspecto_nodulo: ['Sólido', 'Lobulado'],
                            cor: ['Bege', 'Branco'],
                            representacao: ['Fragmento'],
                            medidas: '2,5 x 1,5 x 0,8 cm',
                            medidas_nodulo: '1,2 x 0,8 cm',
                            observacoes: '',
                            cassettes: [
                                { codigo: `${randomId}-A`, numero_sequencial: 1 }
                            ]
                        },
                        {
                            numero: 2,
                            caracteristicas: ['Subcutâneo'],
                            aparencia: ['Irregular'],
                            consistencia: ['Duro'],
                            aspecto_nodulo: ['Cístico (Fluído)'],
                            cor: ['Marrom'],
                            representacao: ['Todo Material incluído'],
                            medidas: '1,0 x 0,8 x 0,5 cm',
                            medidas_nodulo: '0,5 x 0,3 cm',
                            observacoes: '',
                            cassettes: [
                                { codigo: `${randomId}-B`, numero_sequencial: 2 }
                            ]
                        }
                    ]
                },
                {
                    numero: '2',
                    fragments: [
                        {
                            numero: 1,
                            caracteristicas: ['Nodulectomia'],
                            aparencia: ['Alopécico'],
                            consistencia: ['Macio'],
                            aspecto_nodulo: ['Friável'],
                            cor: ['Preto'],
                            representacao: ['Todo Material incluído'],
                            medidas: '3,0 x 2,0 x 1,5 cm',
                            medidas_nodulo: '2,0 x 1,5 cm',
                            observacoes: 'Material recebido em formol 10%.',
                            cassettes: [
                                { codigo: `${randomId}-C`, numero_sequencial: 3 }
                            ]
                        }
                    ]
                }
            ],
            cassettes: []
        });
    };

    const totalFragments = formData.jars.reduce((acc: number, jar: any) => acc + (jar.fragments?.length || 0), 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-32">

            {/* Header - Basic Data */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <FlaskConical size={20} className="text-pink-500" />
                    Dados Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Número da Guia *</label>
                        <input
                            required
                            type="text"
                            className="w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 px-3 py-2"
                            value={formData.numero_guia}
                            onChange={(e) => setFormData({ ...formData, numero_guia: e.target.value })}
                            placeholder="Ex: 12345/23"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Paciente *</label>
                        <input
                            required
                            type="text"
                            className="w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 px-3 py-2"
                            value={formData.nome_paciente}
                            onChange={(e) => setFormData({ ...formData, nome_paciente: e.target.value })}
                            placeholder="Nome do animal"
                        />
                    </div>
                </div>
            </div>

            {/* Jars Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <TestTube size={20} className="text-pink-500" />
                        Frascos e Fragmentos
                        <span className="text-sm font-normal text-gray-500">
                            ({formData.jars.length} frasco{formData.jars.length !== 1 ? 's' : ''}, {totalFragments} fragmento{totalFragments !== 1 ? 's' : ''})
                        </span>
                    </h3>
                    <button
                        type="button"
                        onClick={addJar}
                        className="flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-md hover:bg-pink-100 transition-colors font-medium text-sm border border-pink-200"
                    >
                        <Plus size={18} /> Adicionar Frasco
                    </button>
                </div>

                {formData.jars.map((jar: any, jarIndex: number) => (
                    <div key={jarIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                        {/* Jar Header */}
                        <div className="bg-gray-50 px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="bg-pink-100 p-2 rounded-full text-pink-600 shadow-sm">
                                    <TestTube size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700">Frasco {jar.numero}</span>
                                    <span className="text-xs text-gray-400">
                                        Fragmentos: {jar.fragments?.length || 0}/10
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                <span className="text-sm font-medium text-gray-600">Quantos fragmentos neste frasco? (máximo 10)</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={jar.fragments?.length || 0}
                                    onChange={(e) => handleFragmentCountChange(jarIndex, e.target.value)}
                                    className="w-16 px-2 py-1 flex-shrink-0 text-center font-bold text-pink-700 bg-pink-50 border-2 border-pink-200 rounded focus:bg-white focus:ring-pink-500 focus:border-pink-500 transition-colors cursor-text hover:bg-pink-100"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => removeJar(jarIndex)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                title="Remover Frasco"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Fragments */}
                        <div className="p-5 bg-gray-50/30">
                            {(jar.fragments?.length || 0) === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                    <AlertCircle size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Defina a quantidade de fragmentos acima para começar.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jar.fragments.map((fragment: any, fragIndex: number) => (
                                        <MammaryFragmentSection
                                            key={fragIndex}
                                            index={fragIndex}
                                            fragment={fragment}
                                            baseCode={formData.numero_guia || '000'}
                                            onUpdate={(data) => updateFragment(jarIndex, fragIndex, data)}
                                            onRemove={() => removeFragment(jarIndex, fragIndex)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addJar}
                    className="flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm border-2 border-gray-300 w-full justify-center border-dashed"
                >
                    <Plus size={18} /> Adicionar outro Frasco
                </button>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:pl-72 flex items-center justify-end gap-4 z-10 shadow-lg">
                <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    disabled={!formData.id}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-md hover:bg-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md mr-auto"
                >
                    <Wand2 size={18} /> Relatórios
                </button>

                <button
                    type="button"
                    onClick={fillWithMockData}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2.5 rounded-md hover:bg-purple-200 transition-colors font-medium"
                >
                    <FlaskConical size={18} /> Preencher (Teste)
                </button>

                {success && (
                    <span className="text-green-600 font-medium animate-pulse">
                        Salvo com sucesso!
                    </span>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-md hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Salvando...' : 'Salvar Registro'}
                </button>
            </div>

            {showReportModal && (
                <MammaryReportModal
                    record={savedRecord || formData}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </form>
    );
};

export default MammaryForm;
