import { useState } from 'react';
import { Plus, Save, Loader2, X, FlaskConical } from 'lucide-react';
import api from '../../services/api';

interface MammaryFormData {
    id?: number;
    numero_guia: string;
    nome_paciente: string;
    idade?: string;
    medico_solicitante?: string;
    data_coleta?: string;
    status: string;

    // Specimen
    tipo_especime?: string;
    localizacao?: string;
    lateralidade?: string;
    dimensoes?: string;
    peso?: string;

    // Description
    aspecto_macroscopico?: string;
    consistencia?: string;
    superficie_corte?: string;
    margens?: string;

    // Specifics
    pele?: string;
    areola?: string;
    mamilo?: string;
    tecido_adiposo?: string;

    observacoes?: string;

    jars: any[];
}

interface MammaryFormProps {
    onSaveSuccess?: (record?: any) => void;
}

const MammaryForm = ({ onSaveSuccess }: MammaryFormProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState('especime');

    const [formData, setFormData] = useState<MammaryFormData>({
        numero_guia: '',
        nome_paciente: '',
        status: 'em_analise',
        jars: [{ numero: '1', conteudo: '', dimensoes: '', fixador: 'Formol 10%' }]
    });

    const addJar = () => {
        setFormData({
            ...formData,
            jars: [
                ...formData.jars,
                { numero: String(formData.jars.length + 1), conteudo: '', dimensoes: '', fixador: 'Formol 10%' }
            ]
        });
    };

    const updateJar = (index: number, field: string, value: string) => {
        const newJars = [...formData.jars];
        newJars[index] = { ...newJars[index], [field]: value };
        setFormData({ ...formData, jars: newJars });
    };

    const removeJar = (index: number) => {
        const newJars = formData.jars.filter((_, i) => i !== index);
        const reindexedJars = newJars.map((jar, i) => ({ ...jar, numero: String(i + 1) }));
        setFormData({ ...formData, jars: reindexedJars });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            let savedRecord;
            if (formData.id) {
                const response = await api.put(`/api/mamaria/${formData.id}`, formData);
                savedRecord = response.data;
                setSuccess(true);
            } else {
                const response = await api.post('/api/mamaria', formData);
                savedRecord = response.data;
                setFormData({ ...formData, id: savedRecord.id });
                setSuccess(true);
            }

            if (onSaveSuccess) onSaveSuccess(savedRecord);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error('Error saving mammary record:', error);
            const msg = error.response?.data?.error || error.message || 'Erro desconhecido';
            alert(`Erro ao salvar: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof MammaryFormData, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">

            {/* Header / Basic Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <FlaskConical size={20} className="text-pink-500" />
                    Dados do Exame
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Número da Guia</label>
                        <input
                            required
                            type="text"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.numero_guia}
                            onChange={(e) => updateField('numero_guia', e.target.value)}
                            placeholder="Ex: 12345/23"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Paciente</label>
                        <input
                            required
                            type="text"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.nome_paciente}
                            onChange={(e) => updateField('nome_paciente', e.target.value)}
                            placeholder="Nome completo do animal"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Idade</label>
                        <input
                            type="number"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.idade || ''}
                            onChange={(e) => updateField('idade', e.target.value)}
                            placeholder="Anos"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data da Coleta</label>
                        <input
                            type="date"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-gray-500"
                            value={formData.data_coleta || ''}
                            onChange={(e) => updateField('data_coleta', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Médico Solicitante</label>
                        <input
                            type="text"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                            value={formData.medico_solicitante || ''}
                            onChange={(e) => updateField('medico_solicitante', e.target.value)}
                            placeholder="Dr. Veterinário"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs for Sections */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'especime', name: 'Dados do Espécime' },
                        { id: 'macro', name: 'Descrição Macroscópica' },
                        { id: 'estruturas', name: 'Estruturas Específicas' },
                        { id: 'frascos', name: 'Frascos' },
                        { id: 'obs', name: 'Observações' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSection(tab.id)}
                            className={`${activeSection === tab.id
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* SECTION 1: Specimen Data */}
            {activeSection === 'especime' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Espécime</label>
                            <select
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.tipo_especime || ''}
                                onChange={(e) => updateField('tipo_especime', e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                <option value="Mastectomia Regional">Mastectomia Regional</option>
                                <option value="Mastectomia Total Unilateral">Mastectomia Total Unilateral</option>
                                <option value="Mastectomia Total Bilateral">Mastectomia Total Bilateral</option>
                                <option value="Nodulectomia">Nodulectomia</option>
                                <option value="Fragmento de Biópsia">Fragmento de Biópsia</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Lateralidade</label>
                            <div className="flex gap-4 mt-2">
                                {['Direita', 'Esquerda', 'Bilateral', 'Não Informado'].map(opt => (
                                    <label key={opt} className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-pink-600"
                                            name="lateralidade"
                                            value={opt}
                                            checked={formData.lateralidade === opt}
                                            onChange={(e) => updateField('lateralidade', e.target.value)}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Localização</label>
                            <input
                                type="text"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.localizacao || ''}
                                onChange={(e) => updateField('localizacao', e.target.value)}
                                placeholder="Ex: Mamas abdominais craniais e caudais"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Dimensões (cm)</label>
                            <input
                                type="text"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.dimensoes || ''}
                                onChange={(e) => updateField('dimensoes', e.target.value)}
                                placeholder="Ex: 15,0 x 10,0 x 4,0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Peso (g)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.peso || ''}
                                onChange={(e) => updateField('peso', e.target.value)}
                                placeholder="Ex: 450.5"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: Macroscopic Description */}
            {activeSection === 'macro' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Aspecto Macroscópico Geral</label>
                            <textarea
                                rows={3}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.aspecto_macroscopico || ''}
                                onChange={(e) => updateField('aspecto_macroscopico', e.target.value)}
                                placeholder="Descreva a forma, cor externa, presença de pele..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Consistência</label>
                            <input
                                type="text"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.consistencia || ''}
                                onChange={(e) => updateField('consistencia', e.target.value)}
                                placeholder="Ex: Firme, elástica, duro-elástica..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Ao Corte (Superfície)</label>
                            <textarea
                                rows={3}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.superficie_corte || ''}
                                onChange={(e) => updateField('superficie_corte', e.target.value)}
                                placeholder="Cor, textura, presença de nódulos, cistos, áreas necróticas..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Margens Cirúrgicas</label>
                            <textarea
                                rows={2}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.margens || ''}
                                onChange={(e) => updateField('margens', e.target.value)}
                                placeholder="Avaliação macroscópica das margens..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 3: Specific Structures */}
            {activeSection === 'estruturas' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Pele</label>
                            <textarea
                                rows={2}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.pele || ''}
                                onChange={(e) => updateField('pele', e.target.value)}
                                placeholder="Íntegra, ulcerada, retraída, invadida..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Aréola</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                    value={formData.areola || ''}
                                    onChange={(e) => updateField('areola', e.target.value)}
                                    placeholder="Aspecto..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Mamilo</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                    value={formData.mamilo || ''}
                                    onChange={(e) => updateField('mamilo', e.target.value)}
                                    placeholder="Proeminente, invertido, séssil..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tecido Adiposo Adjacente</label>
                            <textarea
                                rows={2}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                value={formData.tecido_adiposo || ''}
                                onChange={(e) => updateField('tecido_adiposo', e.target.value)}
                                placeholder="Aspecto, invasão..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 4: Jars */}
            {activeSection === 'frascos' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium text-gray-700">Frascos Gerados</h4>
                        <button
                            type="button"
                            onClick={addJar}
                            className="flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-md hover:bg-pink-100 transition-colors font-medium text-sm border border-pink-200"
                        >
                            <Plus size={18} /> Adicionar Frasco
                        </button>
                    </div>

                    {formData.jars.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                            Nenhum frasco adicionado.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {formData.jars.map((jar, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeJar(index)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>

                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="bg-pink-100 text-pink-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                            {jar.numero}
                                        </div>
                                        Frasco {jar.numero}
                                    </h5>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Conteúdo</label>
                                            <input
                                                type="text"
                                                className="w-full text-sm border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                                                value={jar.conteudo}
                                                onChange={(e) => updateJar(index, 'conteudo', e.target.value)}
                                                placeholder="Ex: Nódulo principal, Margem cranial..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dimensões (cm)</label>
                                            <input
                                                type="text"
                                                className="w-full text-sm border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                                                value={jar.dimensoes}
                                                onChange={(e) => updateJar(index, 'dimensoes', e.target.value)}
                                                placeholder="Ex: 2,0 x 1,0 x 0,5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fixador</label>
                                            <input
                                                type="text"
                                                className="w-full text-sm border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                                                value={jar.fixador}
                                                onChange={(e) => updateJar(index, 'fixador', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 5: Observations */}
            {activeSection === 'obs' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Observações Gerais</label>
                    <textarea
                        rows={5}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        value={formData.observacoes || ''}
                        onChange={(e) => updateField('observacoes', e.target.value)}
                        placeholder="Informações adicionais relevantes..."
                    />
                </div>
            )}

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:pl-72 flex items-center justify-end gap-4 z-10 shadow-lg">
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
                    {loading ? 'Salvando...' : 'Salvar Mamária'}
                </button>
            </div>

        </form>
    );
};

export default MammaryForm;
