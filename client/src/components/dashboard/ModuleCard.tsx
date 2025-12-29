import { LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface ModuleCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    disabled?: boolean;
    active?: boolean;
    color?: 'purple' | 'gold';
}

const ModuleCard = ({ title, description, icon: Icon, href, disabled, active, color = 'purple' }: ModuleCardProps) => {
    return (
        <Link
            to={disabled ? '#' : href}
            className={clsx(
                "group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 border-2",
                disabled ? "bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed" : "bg-white hover:shadow-xl hover:-translate-y-1",
                active && !disabled && (color === 'purple' ? "border-primary-100 ring-4 ring-primary-50" : "border-gold-100 ring-4 ring-gold-50"),
                !active && !disabled && "border-transparent border-gray-100"
            )}
        >
            <div className={clsx(
                "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 transition-transform group-hover:scale-150",
                color === 'purple' ? "bg-primary-500" : "bg-gold-500"
            )} />

            <div className="relative z-10">
                <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors",
                    disabled ? "bg-gray-100 text-gray-400" : (
                        color === 'purple'
                            ? "bg-primary-50 text-primary-600 group-hover:bg-primary-500 group-hover:text-white"
                            : "bg-gold-50 text-gold-600 group-hover:bg-gold-500 group-hover:text-white"
                    )
                )}>
                    <Icon size={32} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6 line-clamp-2">{description}</p>

                {!disabled && (
                    <div className={clsx(
                        "flex items-center text-sm font-semibold transition-colors",
                        color === 'purple' ? "text-primary-600" : "text-gold-600"
                    )}>
                        Acessar Módulo <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                )}

                {disabled && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wide">
                        Em Breve
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ModuleCard;
