import { Trash2 } from 'lucide-react';

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
    return (
        <div className="grid grid-cols-12 gap-2 items-center mb-2 p-2 bg-gray-50 rounded border border-gray-100">
            <div className="col-span-1 text-center font-bold text-gray-500">
                #{index + 1}
            </div>

            <div className="col-span-2">
                <select
                    className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={fragment.cor}
                    onChange={(e) => onChange(index, 'cor', e.target.value)}
                >
                    <option value="">Selecione Cor</option>
                    {CORES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="col-span-3">
                <select
                    className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={fragment.consistencia}
                    onChange={(e) => onChange(index, 'consistencia', e.target.value)}
                >
                    <option value="">Selecione Consist.</option>
                    {CONSISTENCIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="col-span-3">
                <input
                    type="text"
                    placeholder="Medidas (ex: 1.0x0.5)"
                    className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={fragment.medidas}
                    onChange={(e) => onChange(index, 'medidas', e.target.value)}
                />
            </div>

            <div className="col-span-2">
                <select
                    className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
