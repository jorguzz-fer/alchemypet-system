import { TestTube, Trash2, AlertCircle } from 'lucide-react';
import FragmentSection from './FragmentSection';

interface JarCardProps {
    index: number;
    jar: any;
    onUpdate: (index: number, data: any) => void;
    onRemove: (index: number) => void;
}

const JarCard = ({ index, jar, onUpdate, onRemove }: JarCardProps) => {

    // Handle changing the number of fragments
    const handleFragmentCountChange = (value: string) => {
        const count = parseInt(value);
        if (isNaN(count) || count < 0) return;

        // Limit to reasonable amount (e.g. 20) to prevent browser crash
        if (count > 20) return;

        const currentFragments = jar.fragments || [];
        let newFragments = [...currentFragments];

        if (count > currentFragments.length) {
            // Add new fragments
            const addedCount = count - currentFragments.length;
            for (let i = 0; i < addedCount; i++) {
                newFragments.push({
                    numero: currentFragments.length + i + 1,
                    caracteristicas: [],
                    aparencia: [],
                    consistencia: [],
                    aspecto_nodulo: [],
                    cor: [],
                    representacao: [],
                    cassettes: []
                });
            }
        } else if (count < currentFragments.length) {
            // Trim fragments (warn user? for now just trim)
            newFragments = newFragments.slice(0, count);
        }

        onUpdate(index, { ...jar, fragments: newFragments });
    };

    const updateFragment = (fIndex: number, fData: any) => {
        const newFragments = [...jar.fragments];
        newFragments[fIndex] = fData;
        onUpdate(index, { ...jar, fragments: newFragments });
    };

    const removeFragment = (fIndex: number) => {
        const newFragments = jar.fragments.filter((_: any, i: number) => i !== fIndex);
        // Re-index remaining fragments
        const reindexed = newFragments.map((f: any, i: number) => ({ ...f, numero: i + 1 }));
        onUpdate(index, { ...jar, fragments: reindexed });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            {/* Jar Header */}
            <div className="bg-gray-50 px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200">

                {/* Left: Title & Input */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600 shadow-sm">
                        <TestTube size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Identificação do Frasco:</label>
                        <input
                            type="text"
                            value={jar.numero}
                            onChange={(e) => onUpdate(index, { ...jar, numero: e.target.value })}
                            className="w-32 px-3 py-1.5 text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 font-bold text-gray-800 shadow-sm"
                            placeholder="Ex: 01"
                        />
                    </div>
                </div>

                {/* Center: Fragment Counter */}
                <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-sm font-medium text-gray-600">Quantos fragmentos neste frasco?</span>
                    <input
                        type="number"
                        min="0"
                        max="20"
                        value={jar.fragments?.length || 0}
                        onChange={(e) => handleFragmentCountChange(e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold text-purple-700 border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* Right: Remove Button */}
                <button
                    onClick={() => onRemove(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Remover Frasco Inteiro"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Fragments Area */}
            <div className="p-5 bg-gray-50/30">
                {(jar.fragments?.length || 0) === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        <AlertCircle size={32} className="mb-2 opacity-50" />
                        <p className="text-sm font-medium">Defina a quantidade de fragmentos acima para começar a descrever.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jar.fragments.map((fragment: any, i: number) => (
                            <FragmentSection
                                key={i}
                                index={i}
                                fragment={fragment}
                                onUpdate={(data) => updateFragment(i, data)}
                                onRemove={() => removeFragment(i)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JarCard;
