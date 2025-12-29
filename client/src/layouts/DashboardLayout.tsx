import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FlaskConical, Stethoscope, LayoutDashboard, Plus, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Macroscopia Geral', href: '/macroscopia', icon: FlaskConical },
        { name: 'Macroscopia Mamária', href: '/mamaria', icon: Stethoscope },
        { name: 'Configurações', href: '/settings', icon: Settings, disabled: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-20 sticky top-0">
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">AlchemyPet</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0 md:bg-white md:static md:h-screen md:shadow-none md:border-r border-gray-200",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="p-6 hidden md:block">
                        <h1 className="text-2xl font-bold text-gray-800">AlchemyPet</h1>
                        <p className="text-sm text-gray-500">Sistema de Análises</p>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-primary-50 text-primary-600 font-semibold"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon size={20} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <LogOut size={20} className="mr-3" />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-0 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
