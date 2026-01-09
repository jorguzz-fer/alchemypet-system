import { X } from 'lucide-react';
import CassetteList from './CassetteList';

interface FragmentSectionProps {
    index: number;
    fragment: any;
    onUpdate: (data: any) => void;
    onRemove: () => void;
}

// Predefined Options (Mocking v14)
const OPTIONS = {
    caracteristicas: ['Cutâneo', 'Não Cutâneo', 'Subcutâneo', 'Nodulectomia', 'Mastectomia', 'Amputação', 'Biopsia Incisional', 'Biopsia Excisional'],
    aparencia: ['Irregular', 'Regular', 'Alopécico', 'Ulcerado', 'Pele Íntegra', 'Pigmentado', 'Elevado/Séssil', 'Pedunculado'],
    consistencia: ['Macio', 'Firme', 'Duro', 'Elástico', 'Friável', 'Cístico (Fluído)', 'Untuoso', 'Cartilaginoso', 'Ósseo'],
    aspecto_nodulo: ['Sólido', 'Cístico', 'Lobulado', 'Homogêneo', 'Heterogêneo', 'Hemorrágico', 'Necrótico', 'Estratificado'],
    cor: ['Branco', 'Bege', 'Amarelo', 'Marrom', 'Preto', 'Cinza', 'Vermelho', 'Vinhoso', 'Acastanhado', 'Perolado'],
    representacao: ['Todo Material', 'Fragmento Representativo', 'Margens', 'Linfonodo']
};

// Semantic Colors Map
const COLOR_MAP: Record<string, string> = {
    'Branco': 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50',
    'Bege': 'bg-[#F5F5DC] text-[#5D4037] border-[#E8E8C8] hover:bg-[#F9F9E0]',
    'Amarelo': 'bg-yellow-300 text-yellow-900 border-yellow-400 hover:bg-yellow-400',
    'Marrom': 'bg-[#795548] text-white border-[#5D4037] hover:bg-[#6D4C41]',
    'Preto': 'bg-gray-900 text-white border-black hover:bg-black',
    'Cinza': 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500',
    'Vermelho': 'bg-red-500 text-white border-red-600 hover:bg-red-600',
    'Vinhoso': 'bg-[#880E4F] text-white border-[#6A0B3D] hover:bg-[#6A0B3D]', // Wine
    'Acastanhado': 'bg-[#A1887F] text-white border-[#8D6E63] hover:bg-[#8D6E63]', // Brownish
    'Perolado': 'bg-[#F2EBD4] text-[#4E342E] border-[#E4DCC5] hover:bg-[#E4DCC5]', // Pearl
};

// Pastel Fallback for non-color options
const PASTEL_COLORS = [
    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
];

// Helper to get color
const getOptionColor = (option: string) => {
    // Check strict map first
    if (COLOR_MAP[option]) return COLOR_MAP[option];

    // Otherwise deterministic pastel
    let hash = 0;
    for (let i = 0; i < option.length; i++) {
        hash = option.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
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

            {/* Selected Tags */}
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

            {/* Options Buttons */}
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

const FragmentSection = ({ index, fragment, onUpdate, onRemove }: FragmentSectionProps) => {
    // Ensure arrays exist (migration fallback)
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
            <div className="absolute -left-3 -top-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                Fragmento {index + 1}
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover fragmento"
            >
                <X size={18} />
            </button>

            {/* Vertical Layout as requested */}
            <div className="space-y-6 pt-2">

                {/* 1. Características */}
                <MultiSelectGroup
                    label="Características"
                    options={OPTIONS.caracteristicas}
                    selected={safeFragment.caracteristicas}
                    onChange={(v) => updateField('caracteristicas', v)}
                />

                {/* 2. Consistência */}
                <MultiSelectGroup
                    label="Consistência"
                    options={OPTIONS.consistencia}
                    selected={safeFragment.consistencia}
                    onChange={(v) => updateField('consistencia', v)}
                />

                {/* 3. Cor */}
                <MultiSelectGroup
                    label="Cor"
                    options={OPTIONS.cor}
                    selected={safeFragment.cor}
                    onChange={(v) => updateField('cor', v)}
                />

                {/* 4. Aparência (Externo) */}
                <MultiSelectGroup
                    label="Aparência (Externo)"
                    options={OPTIONS.aparencia}
                    selected={safeFragment.aparencia}
                    onChange={(v) => updateField('aparencia', v)}
                />

                {/* 5. Ao Corte (Nódulo) */}
                <MultiSelectGroup
                    label="Ao Corte (Nódulo)"
                    options={OPTIONS.aspecto_nodulo}
                    selected={safeFragment.aspecto_nodulo}
                    onChange={(v) => updateField('aspecto_nodulo', v)}
                />

                {/* 6. Medidas do Fragmento */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medidas do Fragmento</label>
                    <input
                        type="text"
                        className="w-full text-sm border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Ex: 3,0 x 2,0 x 1,5 cm"
                        value={safeFragment.medidas || ''}
                        onChange={(e) => updateField('medidas', e.target.value)}
                    />
                </div>

                {/* (Optional/Extra) Medidas do Nódulo - Keeping it as it wasn't explicitly asked to remove, but not in list. 
                    Wait, "Ao Corte (Nódulo)" was asked. "Medidas do Nódulo" is usually paired. I'll put it after Medidas do Fragmento as a safe bet or omit if strictly following list.
                    User list: "Medidas do Fragmento", "Representação".
                    I will keep Medidas do Nódulo separate or remove? The user was specific. 
                    "Medidas do Fragmento" is item 6. "Representação" is item 7.
                    I will append Medidas do Nódulo next to Medidas do Fragmento to avoid losing data capability, but logically placed.
                */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medidas do Nódulo</label>
                    <input
                        type="text"
                        className="w-full text-sm border-2 border-gray-200 rounded focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Se houver..."
                        value={safeFragment.medidas_nodulo || ''}
                        onChange={(e) => updateField('medidas_nodulo', e.target.value)}
                    />
                </div>

                {/* 7. Representação */}
                <MultiSelectGroup
                    label="Representação"
                    options={OPTIONS.representacao}
                    selected={safeFragment.representacao}
                    onChange={(v) => updateField('representacao', v)}
                />

                {/* 8. Observações */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Observações</label>
                    <textarea
                        rows={3}
                        className="w-full text-sm border-2 border-gray-200 rounded focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Detalhes adicionais..."
                        value={safeFragment.observacoes || ''}
                        onChange={(e) => updateField('observacoes', e.target.value)}
                    />
                </div>

                {/* 9. Cassetes / Blocos */}
                <div className="pt-4 border-t border-gray-200">
                    <CassetteList
                        cassettes={safeFragment.cassettes}
                        onUpdate={(v) => updateField('cassettes', v)}
                    />
                </div>

            </div>
        </div>
    );
};

export default FragmentSection;
