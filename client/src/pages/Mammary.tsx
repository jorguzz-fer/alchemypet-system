import { useState, useEffect } from 'react';
import {
    FileText,
    FlaskConical,
    Calendar,
    Search,
    Plus,
    LayoutDashboard,
    Microscope
} from 'lucide-react';
import MammaryForm from '../components/mammary/MammaryForm';
import RecentActivities from '../components/macroscopy/RecentActivities';
import api from '../../services/api';

const Mammary = () => {
    const [viewMode, setViewMode] = useState<'dashboard' | 'create'>('dashboard');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        frascos: 0,
        hoje: 0,
        analise: 0
    });

    // Placeholder for Modal logic
    const [selectedReportExam, setSelectedReportExam] = useState<any | null>(null);

    // Fetch stats on mount and refresh
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real scenario, we would have a specific endpoint for stats.
                // For now, we can approximate or just fetch list and count (not efficient but works for MVP)
                // Or better, just count from the list endpoint if it supports metadata, 
                // but let's assume we want to show zeros or mock for now until we add a stats endpoint.
                // Actually, let's try to get them from the list if possible, or leave as 0 placeholder.
                const response = await api.get('/api/mamaria');
                const records = response.data;

                const today = new Date().toISOString().split('T')[0];
                const todayCount = records.filter((r: any) => r.created_at.startsWith(today)).length;
                const analiseCount = records.filter((r: any) => r.status === 'em_analise').length;
                const totalFrascos = records.reduce((acc: number, r: any) => acc + (r._count?.jars || 0), 0);

                setStats({
                    total: records.length,
                    frascos: totalFrascos,
                    hoje: todayCount,
                    analise: analiseCount
                });
            } catch (error) {
                console.error("Error loading stats", error);
            }
        };
        fetchStats();
    }, [refreshTrigger]);

    const handleSaveSuccess = (record?: any) => {
        setRefreshTrigger(prev => prev + 1);
        if (record) {
            setViewMode('dashboard');
            // Show toast or alert?
            alert('Registro salvo com sucesso!');
        }
    };

    if (viewMode === 'create') {
        return (
            <div className="space-y-6 pb-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Novo Registro</h2>
                        <p className="text-gray-500">Preencha os dados do exame mamário</p>
                    </div>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium border border-gray-300"
                    >
                        <LayoutDashboard size={18} /> Voltar ao Dashboard
                    </button>
                </div>
                <MammaryForm onSaveSuccess={handleSaveSuccess} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg text-white shadow-lg">
                        <Microscope size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Sistema de Macroscopia</h1>
                        <p className="text-sm text-gray-500 font-medium">Análise Histopatológica Mamária</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-100 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => setViewMode('create')}
                        className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={16} /> Novo
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
                        <Search size={16} /> Registros
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
                        <FileText size={16} /> Relatórios
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card 1: Total Registros (Blue) */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-sm font-medium mb-1">Total de Registros</p>
                        <h3 className="text-4xl font-bold">{stats.total}</h3>
                    </div>
                    <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:scale-110 transition-transform duration-300" size={48} />
                </div>

                {/* Card 2: Total Frascos (Green) */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-emerald-100 text-sm font-medium mb-1">Total de Frascos</p>
                        <h3 className="text-4xl font-bold">{stats.frascos}</h3>
                    </div>
                    <FlaskConical className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:scale-110 transition-transform duration-300" size={48} />
                </div>

                {/* Card 3: Hoje (Purple) */}
                <div className="bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-purple-100 text-sm font-medium mb-1">Hoje</p>
                        <h3 className="text-4xl font-bold">{stats.hoje}</h3>
                    </div>
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:scale-110 transition-transform duration-300" size={48} />
                </div>

                {/* Card 4: Em Análise (Orange) */}
                <div className="bg-gradient-to-r from-orange-500 to-red-400 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-orange-100 text-sm font-medium mb-1">Em Análise</p>
                        <h3 className="text-4xl font-bold">{stats.analise}</h3>
                    </div>
                    <Microscope className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:scale-110 transition-transform duration-300" size={48} />
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
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-lg shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 font-semibold">
                        <Search size={24} /> Buscar Registros
                    </button>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg shadow-md transition-all hover:-translate-y-1 flex items-center justify-center gap-3 font-semibold">
                        <FileText size={24} /> Relatórios
                    </button>
                </div>
            </div>

            {/* Recent Records */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 px-1">Registros Recentes</h3>
                <RecentActivities
                    refreshTrigger={refreshTrigger}
                    onOpenReport={(exam) => setSelectedReportExam(exam)}
                    apiEndpoint="/api/mamaria"
                />
            </div>

            {/* Placeholder Modal */}
            {selectedReportExam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Em Desenvolvimento</h3>
                            <button onClick={() => setSelectedReportExam(null)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            A visualização completa do relatório e geração de PDF para o exame <strong>#{selectedReportExam.numero_guia}</strong> será implementada na próxima etapa do desenvolvimento.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedReportExam(null)}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mammary;
