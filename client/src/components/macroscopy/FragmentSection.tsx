import { useState, useRef } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
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
                {selected.map(item => (
                    <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                        {item}
                        <button type="button" onClick={() => handleRemove(item)} className="hover:text-purple-900 focus:outline-none">
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Options Buttons */}
            <div className="flex flex-wrap gap-1.5">
                {options.map(option => (
                    <button
                        key={option}
                        type="button"
                        disabled={selected.includes(option)}
                        onClick={() => handleSelect(option)}
                        className={`text-xs px-2.5 py-1.5 rounded border transition-colors
                            ${selected.includes(option)
                                ? 'bg-gray-100 text-gray-400 border-transparent cursor-default'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
                            }`}
                    >
                        {option}
                    </button>
                ))}
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
            <div className="absolute -left-3 top-5 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-r shadow-sm z-10">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pl-2">

                {/* Left Column: Characteristics & Description */}
                <div className="lg:col-span-8 space-y-4">
                    <MultiSelectGroup
                        label="Características"
                        options={OPTIONS.caracteristicas}
                        selected={safeFragment.caracteristicas}
                        onChange={(v) => updateField('caracteristicas', v)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultiSelectGroup
                            label="Consistência"
                            options={OPTIONS.consistencia}
                            selected={safeFragment.consistencia}
                            onChange={(v) => updateField('consistencia', v)}
                        />
                        <MultiSelectGroup
                            label="Cor"
                            options={OPTIONS.cor}
                            selected={safeFragment.cor}
                            onChange={(v) => updateField('cor', v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MultiSelectGroup
                            label="Aparência (Externo)"
                            options={OPTIONS.aparencia}
                            selected={safeFragment.aparencia}
                            onChange={(v) => updateField('aparencia', v)}
                        />
                        <MultiSelectGroup
                            label="Ao Corte (Nódulo)"
                            options={OPTIONS.aspecto_nodulo}
                            selected={safeFragment.aspecto_nodulo}
                            onChange={(v) => updateField('aspecto_nodulo', v)}
                        />
                    </div>
                </div>

                {/* Right Column: Measurements & Cassettes */}
                <div className="lg:col-span-4 space-y-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
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

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medidas do Nódulo</label>
                        <input
                            type="text"
                            className="w-full text-sm border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Se houver..."
                            value={safeFragment.medidas_nodulo || ''}
                            onChange={(e) => updateField('medidas_nodulo', e.target.value)}
                        />
                    </div>

                    <MultiSelectGroup
                        label="Representação"
                        options={OPTIONS.representacao}
                        selected={safeFragment.representacao}
                        onChange={(v) => updateField('representacao', v)}
                    />

                    <div className="pt-2 border-t border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Observações</label>
                        <textarea
                            rows={3}
                            className="w-full text-sm border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Detalhes adicionais..."
                            value={safeFragment.observacoes || ''}
                            onChange={(e) => updateField('observacoes', e.target.value)}
                        />
                    </div>

                    {/* Cassettes Component */}
                    <CassetteList
                        fragments={fragment}
                        cassettes={safeFragment.cassettes}
                        onUpdate={(v) => updateField('cassettes', v)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FragmentSection;
