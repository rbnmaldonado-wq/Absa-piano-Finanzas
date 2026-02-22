
import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { Target, TrendingUp, PiggyBank, ShoppingBag, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// Map category IDs to budget bands
// Básicos (50%): Hogar(1), Transporte(2), Familia/Alimentación(3), Salud(4)
// Estilo de Vida (30%): Educación(5), Ocio(6), and any other expense category
const BASIC_CATEGORY_IDS = [1, 2, 3, 4];

const BAND_CONFIG = {
    basicos: {
        label: 'Gastos Básicos',
        target: 50,
        color: '#6366f1', // indigo
        gradient: 'from-indigo-500 to-indigo-600',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        icon: ShoppingBag,
        detail: '30% arriendo • 5% cuentas • 10% alimentación • 5% transporte'
    },
    estiloVida: {
        label: 'Estilo de Vida',
        target: 30,
        color: '#a855f7', // purple
        gradient: 'from-purple-500 to-fuchsia-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        icon: TrendingUp,
        detail: 'Gastos personales, ocio, educación'
    },
    ahorro: {
        label: 'Ahorro / Deudas / Inversión',
        target: 20,
        color: '#10b981', // emerald
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: PiggyBank,
        detail: 'Ahorro, pago de deudas e inversión'
    }
};

const BudgetChart = ({ monthIndex }) => {
    const { data } = useFinance();
    const monthData = data.months[monthIndex];
    const categories = data.categories || [];

    const budgetData = useMemo(() => {
        // Calculate total income for the month
        const pianoIncome = monthData.pianoClasses.reduce((acc, c) => acc + Number(c.total), 0);
        const otherIncome = monthData.incomes.reduce((acc, c) => acc + Number(c.amount), 0);
        const totalIncome = pianoIncome + otherIncome;

        // Calculate expenses by band
        let basicosReal = 0;
        let estiloVidaReal = 0;

        // Track per-category expenses for details breakdown with colors
        const categoryBreakdown = {};

        monthData.expenses.forEach(e => {
            const amount = Number(e.amount);
            const catId = Number(e.categoryId);
            const cat = categories.find(c => Number(c.id) === catId);
            const catName = cat?.name || 'Otros';
            const catColor = cat?.color || 'bg-slate-500';

            // Accumulate per-category
            if (!categoryBreakdown[catId]) {
                categoryBreakdown[catId] = { name: catName, amount: 0, color: catColor };
            }
            categoryBreakdown[catId].amount += amount;

            if (BASIC_CATEGORY_IDS.includes(catId)) {
                basicosReal += amount;
            } else {
                estiloVidaReal += amount;
            }
        });

        // Savings total
        const ahorroReal = (monthData.savings || []).reduce((acc, s) => acc + Number(s.amount), 0);

        // Ideal amounts based on income
        const basicosIdeal = totalIncome * 0.50;
        const estiloVidaIdeal = totalIncome * 0.30;
        const ahorroIdeal = totalIncome * 0.20;

        const totalExpenses = basicosReal + estiloVidaReal;

        return {
            totalIncome,
            totalExpenses,
            bands: {
                basicos: { real: basicosReal, ideal: basicosIdeal },
                estiloVida: { real: estiloVidaReal, ideal: estiloVidaIdeal },
                ahorro: { real: ahorroReal, ideal: ahorroIdeal }
            },
            categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.amount - a.amount),
            ahorroReal
        };
    }, [monthData, categories]);

    // Donut chart data
    const donutData = [
        { name: 'Gastos Básicos', value: Math.max(budgetData.bands.basicos.real, 0), color: BAND_CONFIG.basicos.color },
        { name: 'Estilo de Vida', value: Math.max(budgetData.bands.estiloVida.real, 0), color: BAND_CONFIG.estiloVida.color },
        { name: 'Ahorro', value: Math.max(budgetData.ahorroReal, 0), color: BAND_CONFIG.ahorro.color },
    ];

    // If everything is 0, show placeholder
    const hasData = donutData.some(d => d.value > 0);
    if (!hasData && budgetData.totalIncome === 0) {
        donutData[0].value = 50;
        donutData[1].value = 30;
        donutData[2].value = 20;
    }

    // Category donut for expense breakdown (with real category colors)
    const categoryDonutData = budgetData.categoryBreakdown.map(cat => ({
        name: cat.name,
        value: cat.amount,
        color: tailwindToHex(cat.color)
    }));

    const getStatusIcon = (real, ideal) => {
        if (ideal === 0) return { icon: Info, color: 'text-slate-400' };
        const ratio = real / ideal;
        if (ratio <= 1) return { icon: CheckCircle2, color: 'text-emerald-400' };
        if (ratio <= 1.15) return { icon: AlertTriangle, color: 'text-amber-400' };
        return { icon: AlertTriangle, color: 'text-rose-400' };
    };

    const getBarColor = (real, ideal) => {
        if (ideal === 0) return 'bg-slate-500';
        const ratio = real / ideal;
        if (ratio <= 1) return 'bg-emerald-500';
        if (ratio <= 1.15) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                    <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Presupuesto 50/30/20</h3>
                    <p className="text-xs text-slate-500">Basado en ingresos de ${budgetData.totalIncome.toLocaleString('es-CL')}</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Donut */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden shadow-xl"
                >
                    <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-400" />
                        Distribución Presupuestal
                    </h4>
                    <div className="h-52 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                    formatter={(value) => [`$${value.toLocaleString('es-CL')}`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">50/30/20</span>
                            {hasData && (
                                <span className="text-sm font-bold text-white">${budgetData.totalExpenses.toLocaleString('es-CL')}</span>
                            )}
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-3">
                        {donutData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-[10px] text-slate-400 font-medium">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Category Expense Breakdown Donut */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden shadow-xl"
                >
                    <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-rose-400" />
                        Gastos por Categoría
                    </h4>
                    <div className="h-52 w-full relative">
                        {categoryDonutData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryDonutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {categoryDonutData.map((entry, index) => (
                                            <Cell key={`cat-cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            color: '#fff',
                                            fontSize: '13px'
                                        }}
                                        formatter={(value) => [`$${value.toLocaleString('es-CL')}`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <ShoppingBag className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">Sin gastos registrados</p>
                            </div>
                        )}
                        {categoryDonutData.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-sm font-bold text-white">${budgetData.totalExpenses.toLocaleString('es-CL')}</span>
                            </div>
                        )}
                    </div>
                    {/* Category Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                        {categoryDonutData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-[10px] text-slate-400 font-medium">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
                {Object.entries(BAND_CONFIG).map(([key, config]) => {
                    const band = budgetData.bands[key];
                    const BandIcon = config.icon;
                    const status = getStatusIcon(band.real, band.ideal);
                    const StatusIcon = status.icon;
                    const barColor = getBarColor(band.real, band.ideal);
                    const percentage = band.ideal > 0 ? Math.min((band.real / band.ideal) * 100, 150) : 0;
                    const realPercent = budgetData.totalIncome > 0 ? ((band.real / budgetData.totalIncome) * 100).toFixed(1) : 0;

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`p-4 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-white/10 transition-all shadow-lg`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${config.bg} ${config.border} border`}>
                                        <BandIcon className={`w-4 h-4 ${config.text}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{config.label}</p>
                                        <p className="text-[10px] text-slate-500">{config.detail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white font-mono">${band.real.toLocaleString('es-CL')}</p>
                                        <p className="text-[10px] text-slate-500">de ${band.ideal.toLocaleString('es-CL')} ({realPercent}%)</p>
                                    </div>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                                {/* Target marker at 100% */}
                                <div className="absolute top-0 bottom-0 w-px bg-white/30 z-10" style={{ left: `${Math.min(100, (100 / 150) * 100)}%` }}></div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percentage, 100) * (100 / 150)}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`h-full rounded-full ${barColor} shadow-sm`}
                                    style={{ maxWidth: '100%' }}
                                ></motion.div>
                            </div>
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[9px] text-slate-600 font-mono">0%</span>
                                <span className="text-[9px] text-slate-500 font-bold">{config.target}% ideal</span>
                                <span className="text-[9px] text-slate-600 font-mono">150%</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Capacity Summary */}
            {budgetData.totalIncome > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <PiggyBank className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">Capacidad de Ahorro</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ingresos</p>
                            <p className="text-lg font-bold text-white font-mono">${budgetData.totalIncome.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Gastos</p>
                            <p className="text-lg font-bold text-rose-400 font-mono">${budgetData.totalExpenses.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Disponible p/ Ahorro</p>
                            <p className={`text-lg font-bold font-mono ${(budgetData.totalIncome - budgetData.totalExpenses) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ${(budgetData.totalIncome - budgetData.totalExpenses).toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Helper: convert Tailwind bg color class to hex for recharts
function tailwindToHex(twClass) {
    const map = {
        'bg-blue-500': '#3b82f6',
        'bg-green-500': '#22c55e',
        'bg-yellow-500': '#eab308',
        'bg-red-500': '#ef4444',
        'bg-purple-500': '#a855f7',
        'bg-pink-500': '#ec4899',
        'bg-indigo-500': '#6366f1',
        'bg-teal-500': '#14b8a6',
        'bg-emerald-500': '#10b981',
        'bg-orange-500': '#f97316',
        'bg-cyan-500': '#06b6d4',
        'bg-lime-500': '#84cc16',
        'bg-rose-500': '#f43f5e',
        'bg-violet-500': '#8b5cf6',
        'bg-fuchsia-500': '#d946ef',
        'bg-amber-500': '#f59e0b',
        'bg-slate-500': '#64748b',
        'bg-slate-400': '#94a3b8',
    };
    return map[twClass] || '#64748b';
}

export default BudgetChart;
