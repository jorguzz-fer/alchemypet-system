import { useState } from 'react';
import MacroscopyForm from '../components/macroscopy/MacroscopyForm';
import RecentActivities from '../components/macroscopy/RecentActivities';

const Macroscopy = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSaveSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
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

            <RecentActivities refreshTrigger={refreshTrigger} />
        </div>
    );
};

export default Macroscopy;
