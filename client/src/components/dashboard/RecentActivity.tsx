import { useState } from 'react';
import { FileText, Clock } from 'lucide-react';
import api from '../../services/api';
import MacroscopyReportModal from '../macroscopy/MacroscopyReportModal';

interface ActivityItem {
    id: number;
    numero_guia: string;
    nome_paciente: string;
    total_frascos: number;
    total_fragmentos: number;
    status: string;
    created_at: string;
}

interface RecentActivityProps {
    items: ActivityItem[];
}

const RecentActivity = ({ items }: RecentActivityProps) => {
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [loadingRecord, setLoadingRecord] = useState<number | null>(null);

    const handleOpenReport = async (id: number) => {
        try {
            setLoadingRecord(id);
            const response = await api.get(`/api/macroscopy/${id}`);
            setSelectedRecord(response.data);
        } catch (error) {
            console.error("Failed to load record details", error);
            alert("Erro ao carregar relatório.");
        } finally {
            setLoadingRecord(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Atividade Recente</h3>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos</button>
                </div>

                <div className="divide-y divide-gray-50">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            Nenhuma atividade recente
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">Guia: {item.numero_guia}</p>
                                            {/* Green Dot Indicator */}
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" title="Processado"></div>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">{item.nome_paciente}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {item.total_frascos} frasco(s) • {item.total_fragmentos || 0} fragmento(s)
                                        </p>

                                        <button
                                            onClick={() => handleOpenReport(item.id)}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1 hover:underline"
                                            disabled={loadingRecord === item.id}
                                        >
                                            {loadingRecord === item.id ? 'Carregando...' : '📄 Ver Relatório / Cassetes'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                    <Clock size={14} className="mr-1" />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {selectedRecord && (
                <MacroscopyReportModal
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </>
    );
};

export default RecentActivity;
