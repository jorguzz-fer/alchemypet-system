import { FileText, Clock } from 'lucide-react';

interface ActivityItem {
    id: number;
    numero_guia: string;
    nome_paciente: string;
    total_frascos: number;
    status: string;
    created_at: string;
}

interface RecentActivityProps {
    items: ActivityItem[];
}

const RecentActivity = ({ items }: RecentActivityProps) => {
    return (
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
                                    <p className="font-semibold text-gray-900">Guia #{item.numero_guia}</p>
                                    <p className="text-sm text-gray-500">{item.nome_paciente} • {item.total_frascos} frascos</p>
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
    );
};

export default RecentActivity;
