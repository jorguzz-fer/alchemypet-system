import { Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FragmentRowProps {
    index: number;
    fragment: {
        cor: string;
        consistencia: string;
        medidas: string;
        representacao: string;
    };
    onChange: (index: number, field: string, value: string) => void;
    onRemove: (index: number) => void;
}

const CORES = ['Pardacenta', 'Branca', 'Amarela', 'Enegrecida', 'Vinhosa', 'Translúcida'];
const CONSISTENCIAS = ['Firme', 'Elástica', 'Mole', 'Friável', 'Dura', 'Borrachosa'];

const FragmentRow = ({ index, fragment, onChange, onRemove }: FragmentRowProps) => {
    // Determine initial custom states based on value presence in lists
    const [customCor, setCustomCor] = useState(!CORES.includes(fragment.cor) && fragment.cor !== '');
    const [customConsist, setCustomConsist] = useState(!CONSISTENCIAS.includes(fragment.consistencia) && fragment.consistencia !== '');

    // Reset logic if list changes (unlikely) or external reset
    useEffect(() => {
        if (CORES.includes(fragment.cor)) setCustomCor(false);
        if (CONSISTENCIAS.includes(fragment.consistencia)) setCustomConsist(false);
    }, [fragment.cor, fragment.consistencia]);

    const handleSelectChange = (field: string, value: string, setCustom: (v: boolean) => void) => {
        if (value === 'Outros') {
            setCustom(true);
            onChange(index, field, ''); // Clear for typing
        } else {
            setCustom(false);
            onChange(index, field, value);
        }
    };

    const clearCustom = (field: string, setCustom: (v: boolean) => void) => {
        setCustom(false);
        onChange(index, field, '');
    };

    return (
        <div className="grid grid-cols-12 gap-2 items-center mb-2 p-2 bg-gray-50 rounded border border-gray-100">
            <div className="col-span-1 text-center font-bold text-gray-500">
                #{index + 1}
            </div>

            {/* COR */}
            <div className="col-span-2 relative">
                {customCor ? (
                    <div className="flex items-center">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Digite a cor..."
                            className="w-full text-xs border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-6"
                            value={fragment.cor}
                            onChange={(e) => onChange(index, 'cor', e.target.value)}
                        />
                        <button
                            onClick={() => clearCustom('cor', setCustomCor)}
                            className="absolute right-1 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <select
                        className="w-full text-xs border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        value={fragment.cor}
                        onChange={(e) => handleSelectChange('cor', e.target.value, setCustomCor)}
                    >
                        <option value="">Selecione Cor</option>
                        {CORES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Outros">Outros...</option>
                    </select>
                )}
            </div>

            {/* CONSISTENCIA */}
            <div className="col-span-3 relative">
                {customConsist ? (
                    <div className="flex items-center">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Digite a consistência..."
                            className="w-full text-xs border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-6"
                            value={fragment.consistencia}
                            onChange={(e) => onChange(index, 'consistencia', e.target.value)}
                        />
                        <button
                            onClick={() => clearCustom('consistencia', setCustomConsist)}
                            className="absolute right-1 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <select
                        className="w-full text-xs border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        value={fragment.consistencia}
                        onChange={(e) => handleSelectChange('consistencia', e.target.value, setCustomConsist)}
                    >
                        <option value="">Selecione Consist.</option>
                        {CONSISTENCIAS.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Outros">Outros...</option>
                    </select>
                )}
            </div>

            {/* MEDIDAS */}
            <div className="col-span-3">
                <input
                    type="text"
                    placeholder="Medidas (ex: 1.0x0.5)"
                    className="w-full text-xs border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={fragment.medidas}
                    onChange={(e) => onChange(index, 'medidas', e.target.value)}
                />
            </div>

            {/* REPRESENTACAO */}
            <div className="col-span-2">
                <select
                    className="w-full text-xs border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={fragment.representacao}
                    onChange={(e) => onChange(index, 'representacao', e.target.value)}
                >
                    <option value="Total">Total</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Selectiva">Seletiva</option>
                </select>
            </div>

            <div className="col-span-1 flex justify-center">
                <button
                    onClick={() => onRemove(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Remover Fragmento"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default FragmentRow;
