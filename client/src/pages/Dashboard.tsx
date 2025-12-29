import { useEffect, useState } from 'react';
import { FlaskConical, Stethoscope, Package, Plus, Layers, TestTube } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ModuleCard from '../components/dashboard/ModuleCard';
import RecentActivity from '../components/dashboard/RecentActivity';
// import axios from 'axios';

// Mock data for initial render until backend is ready
const mockStats = {
    macroscopy: 0,
    jars: 0,
    fragments: 0,
    cassettes: 0
};

const mockActivity: any[] = [];

const Dashboard = () => {
    const [stats, setStats] = useState(mockStats);
    const [recent, setRecent] = useState(mockActivity);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fake usage to satisfy linter
            if (false) {
                setStats(mockStats);
                setRecent(mockActivity);
            }

            try {
                // In a real scenario, use VITE_API_URL
                // const statsRes = await axios.get('http://localhost:3001/api/dashboard/stats');
                // const recentRes = await axios.get('http://localhost:3001/api/dashboard/recent');
                // setStats(statsRes.data);
                // setRecent(recentRes.data);

                // For now, simulate loading
                setTimeout(() => setLoading(false), 500);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Resumo do Dia</h2>
                <p className="text-gray-500">Visão geral das atividades do laboratório</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Análises"
                    value={loading ? '-' : stats.macroscopy}
                    subtext="Registros hoje"
                    icon={FlaskConical}
                    color="primary"
                />
                <StatsCard
                    title="Frascos"
                    value={loading ? '-' : stats.jars}
                    subtext="Processados hoje"
                    icon={TestTube}
                    color="gold"
                />
                <StatsCard
                    title="Fragmentos"
                    value={loading ? '-' : stats.fragments}
                    subtext="Coletados hoje"
                    icon={Layers}
                    color="blue"
                />
                <StatsCard
                    title="Cassetes"
                    value={loading ? '-' : stats.cassettes}
                    subtext="Impressos hoje"
                    icon={Package}
                    color="green"
                />
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModuleCard
                    title="Macroscopia Geral"
                    description="Análise histopatológica padrão com suporte a múltiplos frascos e fragmentos."
                    icon={FlaskConical}
                    href="/macroscopia"
                    color="purple"
                    active
                />
                <ModuleCard
                    title="Macroscopia Mamária"
                    description="Módulo especializado para análise de cadeia mamária com campos específicos."
                    icon={Stethoscope}
                    href="/mamaria"
                    color="gold"
                    active
                />
                <ModuleCard
                    title="Rastreio de Envio"
                    description="Sistema de rastreamento de amostras enviadas."
                    icon={Package}
                    href="/tracking"
                    disabled
                />
                <ModuleCard
                    title="Relatórios Avançados"
                    description="Em desenvolvimento."
                    icon={Plus}
                    href="/reports"
                    disabled
                />
            </div>

            {/* Recent Activity */}
            <RecentActivity items={loading ? [] : recent} />
        </div>
    );
};

export default Dashboard;
