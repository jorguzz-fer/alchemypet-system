import { useState, useEffect } from 'react';
import { Search, Calendar, FileText, User } from 'lucide-react';
import api from '../../services/api';

interface RecentActivitiesProps {
    refreshTrigger: number;
    onOpenReport: (exam: any) => void;
}

const RecentActivities = ({ refreshTrigger, onOpenReport }: RecentActivitiesProps) => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        date: ''
    });

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.date) params.append('date', filters.date);

            const response = await api.get(`/api/macroscopy?${params.toString()}`);
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [refreshTrigger, filters.date]); // Refetch on trigger or date change

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchActivities();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Últimas Atividades</h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por Guia ou Paciente..."
                        className="pl-10 w-full border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="date"
                        className="pl-10 w-full border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-600"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic">Nenhuma atividade recente encontrada.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Guia</th>
                                <th className="px-4 py-3">Paciente</th>
                                <th className="px-4 py-3">Frascos</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                        <FileText size={16} className="text-purple-500" />
                                        {item.numero_guia}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            {item.nome_paciente}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item._count?.jars || 0}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium 
                                            ${item.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {item.status === 'em_analise' ? 'Em Análise' : item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onOpenReport(item)}
                                            className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline"
                                        >
                                            Ver Análise
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecentActivities;
