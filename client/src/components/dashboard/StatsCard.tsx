import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
    color?: 'primary' | 'gold' | 'blue' | 'green';
}

const StatsCard = ({ title, value, subtext, icon: Icon, color = 'primary' }: StatsCardProps) => {
    const colorStyles = {
        primary: 'bg-primary-50 text-primary-600',
        gold: 'bg-gold-50 text-gold-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    <Icon size={24} />
                </div>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <p className="text-gray-400 text-xs mt-1">{subtext}</p>
            </div>
        </div>
    );
};

export default StatsCard;
