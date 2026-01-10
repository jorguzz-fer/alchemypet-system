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
                onOpenReport={(exam) => setSelectedReportExam(exam)}
                apiEndpoint="/api/mamaria"
            />

            {selectedReportExam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Em Desenvolvimento</h3>
                        <p className="text-gray-600 mb-4">
                            A visualização do relatório para o exame <strong>#{selectedReportExam.numero_guia}</strong> (ID: {selectedReportExam.id}) será implementada na próxima etapa.
                        </p>
                        <button
                            onClick={() => setSelectedReportExam(null)}
                            className="w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mammary;
