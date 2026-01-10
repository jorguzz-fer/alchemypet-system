import { FlaskConical, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="max-w-5xl mx-auto pt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sistema de Análises Macroscopica</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card 1: Macroscopia Geral */}
                <Link
                    to="/macroscopia"
                    className="group bg-white rounded-3xl border-[3px] border-black p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-start gap-6"
                >
                    <div className="p-4 rounded-2xl border-2 border-gray-100 group-hover:bg-gray-50 transition-colors">
                        <FlaskConical size={32} strokeWidth={1.5} className="text-gray-800" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">Macroscopia Geral</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Análise histopatológica padrão com suporte a múltiplos frascos e fragmentos.
                        </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                        Acessar Módulo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Card 2: Macroscopia Mamária */}
                <Link
                    to="/mamaria"
                    className="group bg-white rounded-3xl border-[3px] border-black p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-start gap-6"
                >
                    <div className="p-4 rounded-2xl border-2 border-gray-100 group-hover:bg-gray-50 transition-colors">
                        <Stethoscope size={32} strokeWidth={1.5} className="text-gray-800" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">Macroscopia Mamária</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Módulo especializado para análise de cadeia mamária com campos específicos.
                        </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                        Acessar Módulo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
