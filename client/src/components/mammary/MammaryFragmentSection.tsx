import { X } from 'lucide-react';
import CassetteList from '../macroscopy/CassetteList';

interface MammaryFragmentSectionProps {
    index: number;
    fragment: any;
    baseCode: string;
    onUpdate: (data: any) => void;
    onRemove: () => void;
}

// Mammary-specific options (from reference mamaria-v1)
const OPTIONS = {
    caracteristicas: ['Cutâneo', 'Não Cutâneo', 'Subcutâneo', 'Nodulectomia'],
    aparencia: ['Irregular', 'Alopécico', 'Elevado/Séssil', 'Ulcerado', 'Não ulcerado'],
    consistencia: ['Macio', 'Firme', 'Duro', 'Cístico (Fluído)', 'Fibroelástico'],
    aspecto_nodulo: ['Cístico (Fluído)', 'Sólido', 'Lobulado', 'Friável'],
    cor: ['Branco', 'Bege', 'Marrom', 'Preto'],
    representacao: ['Todo Material incluído', 'Fragmento']
};

// Semantic Colors Map
const COLOR_MAP: Record<string, string> = {
    'Branco': 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50',
    'Bege': 'bg-[#F5F5DC] text-[#5D4037] border-[#E8E8C8] hover:bg-[#F9F9E0]',
    'Marrom': 'bg-[#795548] text-white border-[#5D4037] hover:bg-[#6D4C41]',
    'Preto': 'bg-gray-900 text-white border-black hover:bg-black',
};

const PASTEL_COLORS = [
    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
];

const getOptionColor = (option: string) => {
    if (COLOR_MAP[option]) return COLOR_MAP[option];
    let hash = 0;
    for (let i = 0; i < option.length; i++) {
        hash = option.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
};

const MultiSelectGroup = ({ label, options, selected, onChange }: { label: string, options: string[], selected: string[], onChange: (val: string[]) => void }) => {
    const handleSelect = (option: string) => {
        if (!selected.includes(option)) {
            onChange([...selected, option]);
        }
    };

    const handleRemove = (option: string) => {
        onChange(selected.filter(s => s !== option));
    };

    return (
        <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selected.map(item => {
                    const colorClass = getOptionColor(item);
                    return (
                        <span key={item} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border shadow-sm ${colorClass}`}>
                            {item}
                            <button type="button" onClick={() => handleRemove(item)} className="hover:opacity-75 focus:outline-none">
                                <X size={14} />
                            </button>
                        </span>
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {options.map(option => {
                    const colorClass = getOptionColor(option);
                    const isSelected = selected.includes(option);
                    return (
                        <button
                            key={option}
                            type="button"
                            disabled={isSelected}
                            onClick={() => handleSelect(option)}
                            className={`text-xs px-2.5 py-1.5 rounded border transition-all duration-200 font-medium
                                ${isSelected
                                    ? 'opacity-50 cursor-default bg-gray-100 text-gray-400 border-gray-200'
                                    : `${colorClass} shadow-sm hover:shadow-md transform hover:-translate-y-0.5`
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

const MammaryFragmentSection = ({ index, fragment, baseCode, onUpdate, onRemove }: MammaryFragmentSectionProps) => {
    const safeFragment = {
        ...fragment,
        caracteristicas: fragment.caracteristicas || [],
        aparencia: fragment.aparencia || [],
        consistencia: fragment.consistencia || [],
        aspecto_nodulo: fragment.aspecto_nodulo || [],
        cor: fragment.cor || [],
        representacao: fragment.representacao || [],
        cassettes: fragment.cassettes || []
    };

    const updateField = (field: string, value: any) => {
        onUpdate({ ...safeFragment, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 relative group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        Fragmento {index + 1}
                    </div>
                    <span className="text-sm font-medium text-blue-600">Base: {baseCode}-{String.fromCharCode(65 + index)}</span>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover fragmento"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Cassetes deste Fragmento */}
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <CassetteList
                        cassettes={safeFragment.cassettes}
                        onUpdate={(v) => updateField('cassettes', v)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Característica */}
                    <MultiSelectGroup
                        label="Característica"
                        options={OPTIONS.caracteristicas}
                        selected={safeFragment.caracteristicas}
                        onChange={(v) => updateField('caracteristicas', v)}
                    />

                    {/* Medidas do Fragmento */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Medidas do Fragmento</label>
                        <input
                            type="text"
                            className="w-full text-sm border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                            placeholder="Ex: 2,5 x 1,5 x 0,8 cm"
                            value={safeFragment.medidas || ''}
                            onChange={(e) => updateField('medidas', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Medidas do Nódulo */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Medidas do Nódulo</label>
                        <input
                            type="text"
                            className="w-full text-sm border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                            placeholder="Ex: 1,2 x 0,8 cm"
                            value={safeFragment.medidas_nodulo || ''}
                            onChange={(e) => updateField('medidas_nodulo', e.target.value)}
                        />
                    </div>

                    {/* Aparência do Nódulo */}
                    <MultiSelectGroup
                        label="Aparência do Nódulo"
                        options={OPTIONS.aparencia}
                        selected={safeFragment.aparencia}
                        onChange={(v) => updateField('aparencia', v)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Consistência */}
                    <MultiSelectGroup
                        label="Consistência"
                        options={OPTIONS.consistencia}
                        selected={safeFragment.consistencia}
                        onChange={(v) => updateField('consistencia', v)}
                    />

                    {/* Aspecto do Nódulo */}
                    <MultiSelectGroup
                        label="Aspecto do Nódulo"
                        options={OPTIONS.aspecto_nodulo}
                        selected={safeFragment.aspecto_nodulo}
                        onChange={(v) => updateField('aspecto_nodulo', v)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Cor */}
                    <MultiSelectGroup
                        label="Cor"
                        options={OPTIONS.cor}
                        selected={safeFragment.cor}
                        onChange={(v) => updateField('cor', v)}
                    />

                    {/* Representação */}
                    <MultiSelectGroup
                        label="Representação"
                        options={OPTIONS.representacao}
                        selected={safeFragment.representacao}
                        onChange={(v) => updateField('representacao', v)}
                    />
                </div>

                {/* Observações */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Observações</label>
                    <textarea
                        rows={2}
                        className="w-full text-sm border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Observações adicionais..."
                        value={safeFragment.observacoes || ''}
                        onChange={(e) => updateField('observacoes', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default MammaryFragmentSection;
