import { useState } from 'react';
import { Microscope, LayoutDashboard, Plus, Search, FileText } from 'lucide-react';
import MacroscopyForm from '../components/macroscopy/MacroscopyForm';
import RecentActivities from '../components/macroscopy/RecentActivities';
import MacroscopyReportModal from '../components/macroscopy/MacroscopyReportModal';

const Macroscopy = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedReportExam, setSelectedReportExam] = useState<any | null>(null);

    const handleSaveSuccess = (record?: any) => {
        setRefreshTrigger(prev => prev + 1);
        if (record) {
            setSelectedReportExam(record);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg text-white shadow-lg">
                        <Microscope size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Macroscopia Geral</h1>
                        <p className="text-sm text-gray-500 font-medium">Análise Histopatológica</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-100 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
                        <Plus size={16} /> Novo
                    </button>
                    <button
                        onClick={() => document.getElementById('recent-activities')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
                        <Search size={16} /> Registros
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
                        <FileText size={16} /> Relatórios
                    </button>
                </div>
            </div>

            <MacroscopyForm onSaveSuccess={handleSaveSuccess} />

            <RecentActivities
                refreshTrigger={refreshTrigger}
                onOpenReport={setSelectedReportExam}
            />

            {selectedReportExam && (
                <MacroscopyReportModal
                    record={selectedReportExam}
                    onClose={() => setSelectedReportExam(null)}
                />
            )}
        </div>
    );
};

export default Macroscopy;
