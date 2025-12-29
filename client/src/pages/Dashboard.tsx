import { useEffect, useState } from 'react';
import { FlaskConical, Stethoscope, Package, Plus, Layers, TestTube } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ModuleCard from '../components/dashboard/ModuleCard';
import RecentActivity from '../components/dashboard/RecentActivity';

const mockActivity: any[] = [];

import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        macroscopy: 0,
        jars: 0,
        fragments: 0,
        cassettes: 0
    });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, recentRes] = await Promise.all([
                    api.get('/api/dashboard/stats'),
                    api.get('/api/dashboard/recent')
                ]);

                setStats(statsRes.data);
                setRecent(recentRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
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
