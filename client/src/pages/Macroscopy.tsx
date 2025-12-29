import MacroscopyForm from '../components/macroscopy/MacroscopyForm';

const Macroscopy = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Macroscopia Geral</h2>
                    <p className="text-gray-500">Cadastro de exames e descrição macroscópica</p>
                </div>
            </div>

            <MacroscopyForm />
        </div>
    );
};

export default Macroscopy;
