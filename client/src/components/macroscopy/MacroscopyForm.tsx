import { useState } from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';
import JarCard from './JarCard';

const MacroscopyForm = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        numero_guia: '',
        nome_paciente: '',
        status: 'em_analise',
        jars: [] as any[]
    });

    const addJar = () => {
        setFormData({
            ...formData,
            jars: [
                ...formData.jars,
                { numero: formData.jars.length + 1, fragments: [] }
            ]
        });
    };

    const updateJar = (index: number, jarData: any) => {
        const newJars = [...formData.jars];
        newJars[index] = jarData;
        setFormData({ ...formData, jars: newJars });
    };

    const removeJar = (index: number) => {
        const newJars = formData.jars.filter((_, i) => i !== index);
        // Re-index jars
        const reindexedJars = newJars.map((jar, i) => ({ ...jar, numero: i + 1 }));
        setFormData({ ...formData, jars: reindexedJars });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            if (formData.id) {
                // Update Existing
                await api.put(`/api/macroscopy/${formData.id}`, formData);
                setSuccess(true);
            } else {
                // Create New
                const response = await api.post('/api/macroscopy', formData);
                // Switch to Edit Mode with returned ID
                setFormData({ ...formData, id: response.data.id } as any);
                setSuccess(true);
            }

            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving macroscopy:', error);
            alert('Erro ao salvar. Verifique se o número da guia já existe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Header / Patient Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Informações do Exame</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Número da Guia</label>
                        <input
                            required
                            type="text"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            value={formData.numero_guia}
                            onChange={(e) => setFormData({ ...formData, numero_guia: e.target.value })}
                            placeholder="Ex: 12345/23"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Paciente</label>
                        <input
                            required
                            type="text"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            value={formData.nome_paciente}
                            onChange={(e) => setFormData({ ...formData, nome_paciente: e.target.value })}
                            placeholder="Nome completo do animal ou tutor"
                        />
                    </div>
                </div>
            </div>

            {/* Jars Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Frascos e Amostras</h3>
                    <button
                        type="button"
                        onClick={addJar}
                        className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors font-medium text-sm border border-purple-200"
                    >
                        <Plus size={18} /> Adicionar Frasco
                    </button>
                </div>

                {formData.jars.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                        <p>Nenhum frasco adicionado.</p>
                        <p className="text-sm text-gray-400 mt-1">Clique em "Adicionar Frasco" para começar a descrever as amostras.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.jars.map((jar, i) => (
                            <JarCard
                                key={i}
                                index={i}
                                jar={jar}
                                onUpdate={updateJar}
                                onRemove={removeJar}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
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
                    {loading ? 'Salvando...' : 'Salvar Exame Completo'}
                </button>
            </div>
        </form>
    );
};

export default MacroscopyForm;
