import { useState } from 'react';
import { LayoutDashboard, Plus, Search, FileText, FlaskConical } from 'lucide-react';
import MacroscopyForm from '../components/macroscopy/MacroscopyForm';
import RecentActivities from '../components/macroscopy/RecentActivities';
import MacroscopyReportModal from '../components/macroscopy/MacroscopyReportModal';


const Macroscopy = () => {
    const [viewMode, setViewMode] = useState<'dashboard' | 'create'>('dashboard');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedReportExam, setSelectedReportExam] = useState<any | null>(null);


    const handleSaveSuccess = (record?: any) => {
        setRefreshTrigger(prev => prev + 1);
        if (record) {
            setViewMode('dashboard');
            alert('Registro salvo com sucesso!');
        }
    };

    if (viewMode === 'create') {
        return (
            <div className="space-y-6 pb-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Novo Registro</h2>
                        <p className="text-gray-500">Preencha os dados do exame macroscópico</p>
                    </div>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium border border-gray-300"
                    >
                        <LayoutDashboard size={18} /> Voltar ao Dashboard
                    </button>
                </div>
                <MacroscopyForm onSaveSuccess={handleSaveSuccess} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg text-white shadow-lg">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Macroscopia Geral</h1>
                        <p className="text-sm text-gray-500 font-medium">Análise Histopatológica</p>
                    </div>
                </div>

            </div>


            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => setViewMode('create')}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 font-semibold"
                    >
                        <Plus size={24} /> Novo Registro
                    </button>
                    <button
                        onClick={() => document.getElementById('recent-activities')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-lg shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 font-semibold">
                        <Search size={24} /> Buscar Registros
                    </button>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 font-semibold">
                        <FileText size={24} /> Relatórios
                    </button>
                </div>
            </div>

            <div id="recent-activities">
                <h3 className="text-xl font-bold text-gray-800 mb-4 px-1">Registros Recentes</h3>
                <RecentActivities
                    refreshTrigger={refreshTrigger}
                    onOpenReport={setSelectedReportExam}
                />
            </div>

            {selectedReportExam && (
                <MacroscopyReportModal
                    record={selectedReportExam}
                    onClose={() => setSelectedReportExam(null)}
                    onSaved={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </div>
    );
};

export default Macroscopy;
