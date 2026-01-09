import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FlaskConical, Stethoscope, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed on desktop
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
                "fixed inset-y-0 left-0 z-10 bg-white shadow-lg transform transition-all duration-300 ease-in-out md:translate-x-0 md:bg-white md:static md:h-screen md:shadow-none md:border-r border-gray-200 flex flex-col",
                isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
                isCollapsed ? "md:w-20" : "md:w-64"
            )}>
                {/* Sidebar Header */}
                <div className={clsx("p-4 flex items-center justify-between", isCollapsed ? "flex-col gap-4" : "")}>

                    {/* Logo/Title - Hide text if collapsed */}
                    <div className={clsx("transition-opacity duration-200", isCollapsed ? "hidden md:hidden" : "block")}>
                        <h1 className="text-2xl font-bold text-gray-800">AlchemyPet</h1>
                        <p className="text-sm text-gray-500">Sistema de Análises</p>
                    </div>

                    {/* Collapsed Logo Icon */}
                    <div className={clsx("md:hidden", isCollapsed && "md:block text-purple-600 font-bold text-2xl")}>
                        AP
                    </div>

                    {/* Collapse Toggle Button (Desktop only) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title={isCollapsed ? "Expandir" : "Recolher"}
                    >
                        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={clsx(
                                    "flex items-center p-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary-50 text-primary-600 font-semibold"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                                    isCollapsed ? "justify-center" : "space-x-3"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon size={24} className={clsx("flex-shrink-0", isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-900")} />

                                {!isCollapsed && <span>{item.name}</span>}

                                {/* Tooltip for collapsed mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className={clsx(
                        "flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors",
                        isCollapsed ? "justify-center" : "px-4"
                    )}>
                        <LogOut size={20} className={clsx(!isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-gray-50">
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
