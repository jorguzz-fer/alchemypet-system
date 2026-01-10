import { useState } from 'react';
import MammaryForm from '../components/mammary/MammaryForm';
import RecentActivities from '../components/macroscopy/RecentActivities';

const Mammary = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // TODO: Create a specific ReportModal for Mammary later. For now just view logic.
    const [selectedReportExam, setSelectedReportExam] = useState<any | null>(null);

    const handleSaveSuccess = (record?: any) => {
        setRefreshTrigger(prev => prev + 1);
        if (record) {
            setSelectedReportExam(record);
            // Alert for now as we don't have the Modal yet
            alert('Registro salvo! O Modal de Relatório Mamária será implementado em breve.');
        }
    };

    return (
        <div className="space-y-6 pb-20"> {/* Padding/margin for fixed footer */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Macroscopia Mamária</h2>
                    <p className="text-gray-500">Cadastro de exames de mastectomia e biópsias mamárias</p>
                </div>
            </div>

            <MammaryForm onSaveSuccess={handleSaveSuccess} />

            <RecentActivities
                refreshTrigger={refreshTrigger}
                onOpenReport={(exam) => {
                    setSelectedReportExam(exam);
                    alert('Visualização de Relatório Mamária em breve.');
                }}
                apiEndpoint="/api/mamaria"
            />
        </div>
    );
};

export default Mammary;
