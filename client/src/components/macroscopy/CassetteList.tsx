import { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';

interface CassetteListProps {
    fragments: any; // Parent fragment data to derive IDs if needed
    cassettes: any[];
    onUpdate: (cassettes: any[]) => void;
}

const CassetteList = ({ fragments, cassettes, onUpdate }: CassetteListProps) => {
    // Determine the next cassette number/letter based on existing ones could be complex, 
    // but for now we'll just suggest "Cassete X". 
    // A better approach for "v14" might come later, but for now simple increment.

    const addCassette = () => {
        const nextNum = cassettes.length + 1;
        onUpdate([...cassettes, { codigo: `Cassete ${nextNum}`, numero_sequencial: nextNum }]);
    };

    const updateCassette = (index: number, value: string) => {
        const newCassettes = [...cassettes];
        newCassettes[index] = { ...newCassettes[index], codigo: value };
        onUpdate(newCassettes);
    };

    const removeCassette = (index: number) => {
        const newCassettes = cassettes.filter((_, i) => i !== index);
        onUpdate(newCassettes);
    };

    return (
        <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag size={12} /> Cassetes / Blocos
            </h5>

            <div className="space-y-2">
                {cassettes.map((cassette, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                            <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                            <input
                                type="text"
                                className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-0 text-gray-700 font-medium placeholder-gray-300"
                                value={cassette.codigo}
                                onChange={(e) => updateCassette(index, e.target.value)}
                                placeholder="Identificação do Cassete"
                            />
                        </div>
                        <button
                            onClick={() => removeCassette(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remover cassete"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addCassette}
                className="mt-3 text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium"
            >
                <Plus size={14} /> Adicionar Cassete
            </button>
        </div>
    );
};

export default CassetteList;
