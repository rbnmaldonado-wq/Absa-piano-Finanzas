
import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Music } from 'lucide-react';

const Dashboard = () => {
    const { data } = useFinance();

    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        const monthlyData = data.months.map(m => {
            const mIncome = m.incomes.reduce((acc, curr) => acc + Number(curr.amount), 0)
                + m.pianoClasses.reduce((acc, curr) => acc + Number(curr.total), 0);
            const mExpense = m.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

            income += mIncome;
            expense += mExpense;

            return {
                name: m.name.substring(0, 3), // Jan, Feb...
                fullMonth: m.name,
                Income: mIncome,
                Expense: mExpense
            };
        });

        return { totalIncome: income, totalExpense: expense, balance: income - expense, chartData: monthlyData };
    }, [data]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Dashboard Financiero {data.year}
                </h1>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Ingresos Totales"
                    amount={summary.totalIncome}
                    icon={TrendingUp}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                    delay={0.1}
                />
                <KPICard
                    title="Gastos Totales"
                    amount={summary.totalExpense}
                    icon={TrendingDown}
                    color="text-rose-500"
                    bg="bg-rose-500/10"
                    delay={0.2}
                />
                <KPICard
                    title="Balance Anual"
                    amount={summary.balance}
                    icon={Wallet}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    delay={0.3}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income vs Expense Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl shadow-black/20"
                >
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                            <Music className="w-5 h-5" />
                        </div>
                        Flujo de Caja Mensual
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={summary.chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Income"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    name="Ingresos"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Expense"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    name="Gastos"
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Expenses Distribution Placeholder or Summary */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl shadow-black/20 flex flex-col justify-center items-center text-center"
                >
                    {/* Ambient Glows */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="p-4 bg-indigo-500/10 backdrop-blur-sm rounded-2xl mb-6 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <Wallet className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 relative z-10 text-white">Resumen Rápido</h3>
                    <p className="text-slate-400 mb-8 max-w-sm leading-relaxed relative z-10">
                        Tienes un balance positivo este año. ¡Sigue así!
                        Tus ingresos provienen mayoritariamente de las clases de piano.
                    </p>
                    <button className="px-8 py-3 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 relative z-10">
                        Ver Detalles
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

const KPICard = ({ title, amount, icon: Icon, color, bg, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group shadow-2xl shadow-black/20 relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${amount >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {amount >= 0 ? '+2.5%' : '-1.2%'}
                </span>
            </div>
            <h3 className="text-slate-400 text-sm font-semibold tracking-wide uppercase relative z-10">{title}</h3>
            <p className="text-3xl font-bold mt-2 text-white tracking-tight relative z-10">
                ${amount.toLocaleString('es-CL')}
            </p>
        </motion.div>
    );
};

export default Dashboard;
