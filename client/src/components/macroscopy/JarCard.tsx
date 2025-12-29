import { TestTube, Plus } from 'lucide-react';
import FragmentRow from './FragmentRow';

interface JarCardProps {
    index: number;
    jar: any;
    onUpdate: (index: number, data: any) => void;
    onRemove: (index: number) => void;
}

const JarCard = ({ index, jar, onUpdate, onRemove }: JarCardProps) => {
    const addFragment = () => {
        const newFragments = [
            ...jar.fragments,
            { cor: '', consistencia: '', medidas: '', representacao: 'Total' }
        ];
        onUpdate(index, { ...jar, fragments: newFragments });
    };

    const updateFragment = (fIndex: number, field: string, value: string) => {
        const newFragments = [...jar.fragments];
        newFragments[fIndex] = { ...newFragments[fIndex], [field]: value };
        onUpdate(index, { ...jar, fragments: newFragments });
    };

    const removeFragment = (fIndex: number) => {
        const newFragments = jar.fragments.filter((_: any, i: number) => i !== fIndex);
        onUpdate(index, { ...jar, fragments: newFragments });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden">
            {/* Jar Header */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-1.5 rounded-full text-purple-600">
                        <TestTube size={18} />
                    </div>
                    <span className="font-semibold text-gray-700">Frasco #{index + 1}</span>
                </div>
                <button onClick={() => onRemove(index)} className="text-sm text-red-500 hover:text-red-700">
                    Remover Frasco
                </button>
            </div>

            {/* Fragments List */}
            <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Fragmentos</h4>
                    <button
                        onClick={addFragment}
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                        <Plus size={16} /> Adicionar
                    </button>
                </div>

                {jar.fragments.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm">
                        Nenhum fragmento adicionado neste frasco.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-2 px-2 text-xs font-medium text-gray-500 mb-1">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-2">Cor</div>
                            <div className="col-span-3">Consistência</div>
                            <div className="col-span-3">Medidas</div>
                            <div className="col-span-2">Representação</div>
                            <div className="col-span-1"></div>
                        </div>

                        {jar.fragments.map((fragment: any, i: number) => (
                            <FragmentRow
                                key={i}
                                index={i}
                                fragment={fragment}
                                onChange={updateFragment}
                                onRemove={removeFragment}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JarCard;
