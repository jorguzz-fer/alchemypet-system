import { useState } from 'react';
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Macroscopia Geral</h2>
                    <p className="text-gray-500">Cadastro de exames e descrição macroscópica</p>
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
