import { X } from 'lucide-react';
import CassetteList from './CassetteList';

interface FragmentSectionProps {
    index: number;
    fragment: any;
    onUpdate: (data: any) => void;
    onRemove: () => void;
}

// Predefined Options (Mocking v14)
// Predefined Options (Mocking v14)
const OPTIONS = {
    caracteristicas: ['Cutâneo', 'Não Cutâneo', 'Subcutâneo', 'Nodulectomia', 'Órgão', 'Amputação'],
    aparencia: ['Irregular', 'Regular', 'Alopécico', 'Ulcerado', 'Não ulcerado', 'Elevado/Séssil', 'Pedunculado', 'Verrucoso'],
    consistencia: ['Macio', 'Firme', 'Duro', 'Elástico', 'Friável', 'Cístico (Fluído)', 'Untuoso', 'Fibroelástico'],
    aspecto_nodulo: ['Sólido', 'Cístico', 'Lobulado', 'Homogêneo', 'Heterogêneo', 'Hemorrágico', 'Necrótico'],
    cor: ['Branco', 'Bege', 'Amarelo', 'Marrom', 'Preto', 'Acastanhado'],
    representacao: ['Todo Material', 'Fragmento Representativo', 'Margens', 'Linfonodo']
};

// Semantic Colors Map
const COLOR_MAP: Record<string, string> = {
    'Branco': 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50',
    'Bege': 'bg-[#F5F5DC] text-[#5D4037] border-[#E8E8C8] hover:bg-[#F9F9E0]',
    'Amarelo': 'bg-yellow-300 text-yellow-900 border-yellow-400 hover:bg-yellow-400',
    'Marrom': 'bg-[#795548] text-white border-[#5D4037] hover:bg-[#6D4C41]',
    'Preto': 'bg-gray-900 text-white border-black hover:bg-black',
    'Acastanhado': 'bg-[#A1887F] text-white border-[#8D6E63] hover:bg-[#8D6E63]', // Brownish
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

interface MultiSelectGroupProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (val: string[]) => void;
    showBlockInput?: boolean;
    blocks?: Record<string, string>;
    onBlockChange?: (option: string, block: string) => void;
}

const MultiSelectGroup = ({ label, options, selected, onChange, showBlockInput, blocks, onBlockChange }: MultiSelectGroupProps) => {
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
                        <div key={item} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border shadow-sm ${colorClass}`}>
                            <span>{item}</span>
                            {showBlockInput && (
                                <input
                                    type="text"
                                    placeholder="Bloco"
                                    value={blocks?.[item] || ''}
                                    onChange={(e) => onBlockChange?.(item, e.target.value)}
                                    className="w-16 h-6 px-1 text-xs text-black border border-gray-300 rounded ml-1 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}
                            <button type="button" onClick={() => handleRemove(item)} className="hover:opacity-75 focus:outline-none ml-1">
                                <X size={14} />
                            </button>
                        </div>
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
        cassettes: fragment.cassettes || [],
        consistencia_blocos: fragment.consistencia_blocos || {},
        cor_blocos: fragment.cor_blocos || {},
        orgao_nome: fragment.orgao_nome || ''
    };

    const updateField = (field: string, value: any) => {
        onUpdate({ ...safeFragment, [field]: value });
    };

    const updateBlock = (field: string, option: string, block: string) => {
        const fieldName = `${field}_blocos`;
        const currentBlocks = (safeFragment as Record<string, any>)[fieldName] || {};
        onUpdate({
            ...safeFragment,
            [fieldName]: { ...currentBlocks, [option]: block }
        });
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

                {/* 1. Medidas do Fragmento */}
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

                {/* 2. Medidas do Nódulo */}
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

                {/* 3. Características */}
                <div>
                    <MultiSelectGroup
                        label="Características"
                        options={OPTIONS.caracteristicas}
                        selected={safeFragment.caracteristicas}
                        onChange={(v) => updateField('caracteristicas', v)}
                    />
                    {safeFragment.caracteristicas.includes('Órgão') && (
                        <div className="mt-2 pl-2 border-l-2 border-purple-200">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Qual órgão?</label>
                            <input
                                type="text"
                                className="w-1/2 text-sm border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Ex: Baço, Testículo, Linfonodo..."
                                value={safeFragment.orgao_nome || ''}
                                onChange={(e) => updateField('orgao_nome', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* 4. Consistência */}
                <MultiSelectGroup
                    label="Consistência"
                    options={OPTIONS.consistencia}
                    selected={safeFragment.consistencia}
                    onChange={(v) => updateField('consistencia', v)}
                    showBlockInput={true}
                    blocks={safeFragment.consistencia_blocos}
                    onBlockChange={(opt, val) => updateBlock('consistencia', opt, val)}
                />

                {/* 5. Cor */}
                <MultiSelectGroup
                    label="Cor"
                    options={OPTIONS.cor}
                    selected={safeFragment.cor}
                    onChange={(v) => updateField('cor', v)}
                    showBlockInput={true}
                    blocks={safeFragment.cor_blocos}
                    onBlockChange={(opt, val) => updateBlock('cor', opt, val)}
                />

                {/* 6. Aparência (Externo) */}
                <MultiSelectGroup
                    label="Aparência (Externo)"
                    options={OPTIONS.aparencia}
                    selected={safeFragment.aparencia}
                    onChange={(v) => updateField('aparencia', v)}
                />

                {/* 7. Ao Corte (Nódulo) */}
                <MultiSelectGroup
                    label="Ao Corte (Nódulo)"
                    options={OPTIONS.aspecto_nodulo}
                    selected={safeFragment.aspecto_nodulo}
                    onChange={(v) => updateField('aspecto_nodulo', v)}
                />

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
