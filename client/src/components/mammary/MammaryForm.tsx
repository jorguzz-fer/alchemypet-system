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

const PASTEL_COLORS = [
    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
    'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
];

const getOptionColor = (option: string) => {
    let hash = 0;
    for (let i = 0; i < option.length; i++) {
        hash = option.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
};

const SingleSelectGroup = ({ label, options, selected, onChange }: { label: string, options: string[], selected?: string, onChange: (val: string) => void }) => {
    return (
        <div className="mb-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const colorClass = getOptionColor(option);
                    const isSelected = selected === option;

                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onChange(option)}
                            className={`text-sm px-3 py-1.5 rounded-md border-2 transition-all duration-200 font-medium
                                    ${isSelected
                                    ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105'
                                    : `${colorClass} hover:shadow-md hover:-translate-y-0.5 opacity-80 hover:opacity-100`
                                }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const MammaryForm = ({ onSaveSuccess }: MammaryFormProps) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Helper for today's date in YYYY-MM-DD
    const getToday = () => new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<MammaryFormData>({
        numero_guia: '',
        nome_paciente: '',
        data_coleta: getToday(), // Default to today
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

    // Common input class for high visibility
    const inputClass = "w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 px-3 py-2";

    const fillWithMockData = () => {
        setFormData({
            ...formData,
            numero_guia: '12345/24',
            nome_paciente: 'Bolinha',
            idade: '8',
            medico_solicitante: 'Dr. Fernando',
            tipo_especime: 'Mastectomia Total Unilateral',
            lateralidade: 'Esquerda',
            localizacao: 'Mamas inguinais e abdominais',
            dimensoes: '15,0 x 8,0 x 4,0',
            peso: '350.5',
            aspecto_macroscopico: 'Segmento cutâneo com relevo irregular e área ulcerada central de 2,0 cm.',
            consistencia: 'Firme e elástica',
            superficie_corte: 'Superfície de corte brancacenta com áreas císticas e focos de hemorragia.',
            margens: 'Livres macroscopicamente, distando 0,5 cm da lesão.',
            pele: 'Ulcerada na região central.',
            areola: 'Presente, sem alterações visíveis.',
            mamilo: 'Invertido e retraído.',
            tecido_adiposo: 'Amarelo e lobulado, sem sinais de invasão macroscópica.',
            observacoes: 'Material enviado em formol 10%.',
            jars: [
                { numero: '1', conteudo: 'Nódulo Principal + Margens', dimensoes: '3,0 x 2,0 x 1,0', fixador: 'Formol 10%' },
                { numero: '2', conteudo: 'Linfonodo Inguinal', dimensoes: '1,0 x 0,5 x 0,5', fixador: 'Formol 10%' }
            ]
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-32">

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
                            className={inputClass}
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
                            className={inputClass}
                            value={formData.nome_paciente}
                            onChange={(e) => updateField('nome_paciente', e.target.value)}
                            placeholder="Nome completo do animal"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Idade</label>
                        <input
                            type="number"
                            className={inputClass}
                            value={formData.idade || ''}
                            onChange={(e) => updateField('idade', e.target.value)}
                            placeholder="Anos"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data da Coleta</label>
                        <input
                            type="date"
                            className={`${inputClass} text-gray-600`}
                            value={formData.data_coleta || ''}
                            onChange={(e) => updateField('data_coleta', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Médico Solicitante</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={formData.medico_solicitante || ''}
                            onChange={(e) => updateField('medico_solicitante', e.target.value)}
                            placeholder="Dr. Veterinário"
                        />
                    </div>
                </div>
            </div>

            {/* Vertical Stack Layout */}

            {/* SECTION 1: Specimen Data */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Dados do Espécime</h4>

                <div className="mb-6">
                    <SingleSelectGroup
                        label="Tipo de Espécime"
                        options={[
                            "Mastectomia Regional",
                            "Mastectomia Total Unilateral",
                            "Mastectomia Total Bilateral",
                            "Nodulectomia",
                            "Fragmento de Biópsia"
                        ]}
                        selected={formData.tipo_especime}
                        onChange={(val) => updateField('tipo_especime', val)}
                    />
                </div>

                <div className="mb-6">
                    <SingleSelectGroup
                        label="Lateralidade"
                        options={['Direita', 'Esquerda', 'Bilateral', 'Não Informado']}
                        selected={formData.lateralidade}
                        onChange={(val) => updateField('lateralidade', val)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Localização</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={formData.localizacao || ''}
                            onChange={(e) => updateField('localizacao', e.target.value)}
                            placeholder="Ex: Mamas abdominais craniais e caudais"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Dimensões (cm)</label>
                        <input
                            type="text"
                            className={inputClass}
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
                            className={inputClass}
                            value={formData.peso || ''}
                            onChange={(e) => updateField('peso', e.target.value)}
                            placeholder="Ex: 450.5"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 2: Macroscopic Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Descrição Macroscópica</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Aspecto Macroscópico Geral</label>
                        <textarea
                            rows={3}
                            className={inputClass}
                            value={formData.aspecto_macroscopico || ''}
                            onChange={(e) => updateField('aspecto_macroscopico', e.target.value)}
                            placeholder="Descreva a forma, cor externa, presença de pele..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Consistência</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={formData.consistencia || ''}
                            onChange={(e) => updateField('consistencia', e.target.value)}
                            placeholder="Ex: Firme, elástica, duro-elástica..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Ao Corte (Superfície)</label>
                        <textarea
                            rows={3}
                            className={inputClass}
                            value={formData.superficie_corte || ''}
                            onChange={(e) => updateField('superficie_corte', e.target.value)}
                            placeholder="Cor, textura, presença de nódulos, cistos, áreas necróticas..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Margens Cirúrgicas</label>
                        <textarea
                            rows={2}
                            className={inputClass}
                            value={formData.margens || ''}
                            onChange={(e) => updateField('margens', e.target.value)}
                            placeholder="Avaliação macroscópica das margens..."
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 3: Specific Structures */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-pink-500">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Estruturas Específicas</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Pele</label>
                        <textarea
                            rows={2}
                            className={inputClass}
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
                                className={inputClass}
                                value={formData.areola || ''}
                                onChange={(e) => updateField('areola', e.target.value)}
                                placeholder="Aspecto..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Mamilo</label>
                            <input
                                type="text"
                                className={inputClass}
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
                            className={inputClass}
                            value={formData.tecido_adiposo || ''}
                            onChange={(e) => updateField('tecido_adiposo', e.target.value)}
                            placeholder="Aspecto, invasão..."
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 4: Jars */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-emerald-500">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Frascos Gerados</h4>
                <div className="space-y-4">
                    {formData.jars.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                            Nenhum frasco adicionado.
                            <button
                                type="button"
                                onClick={addJar}
                                className="block mx-auto mt-2 text-pink-600 hover:underline"
                            >
                                Adicionar agora
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {formData.jars.map((jar, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
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
                                                className={inputClass}
                                                value={jar.conteudo}
                                                onChange={(e) => updateJar(index, 'conteudo', e.target.value)}
                                                placeholder="Ex: Nódulo principal, Margem cranial..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dimensões (cm)</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={jar.dimensoes}
                                                onChange={(e) => updateJar(index, 'dimensoes', e.target.value)}
                                                placeholder="Ex: 2,0 x 1,0 x 0,5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fixador</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                value={jar.fixador}
                                                onChange={(e) => updateJar(index, 'fixador', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={addJar}
                        className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm border-2 border-gray-300 w-full justify-center border-dashed"
                    >
                        <Plus size={18} /> Adicionar Outro Frasco
                    </button>
                </div>
            </div>

            {/* SECTION 5: Observations */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
                <label className="block text-lg font-semibold text-gray-800 mb-2">Observações Gerais</label>
                <textarea
                    rows={5}
                    className={inputClass}
                    value={formData.observacoes || ''}
                    onChange={(e) => updateField('observacoes', e.target.value)}
                    placeholder="Informações adicionais relevantes..."
                />
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:pl-72 flex items-center justify-end gap-4 z-10 shadow-lg">
                <button
                    type="button"
                    onClick={fillWithMockData}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2.5 rounded-md hover:bg-purple-200 transition-colors font-medium mr-auto"
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
                    {loading ? 'Salvando...' : 'Salvar Mamária'}
                </button>
            </div>

        </form>
    );
};

export default MammaryForm;
