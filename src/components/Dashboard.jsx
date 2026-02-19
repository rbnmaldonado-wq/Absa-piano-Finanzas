
import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Music } from 'lucide-react';

const Dashboard = () => {
    const { data } = useFinance();

    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        const categoryExpenses = {};

        const monthlyData = data.months.map(m => {
            const mIncome = m.incomes.reduce((acc, curr) => acc + Number(curr.amount), 0)
                + m.pianoClasses.reduce((acc, curr) => acc + Number(curr.total), 0);
            const mExpense = m.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

            // Aggregate expenses by category
            m.expenses.forEach(e => {
                const cat = e.category || 'Otros';
                categoryExpenses[cat] = (categoryExpenses[cat] || 0) + Number(e.amount);
            });

            income += mIncome;
            expense += mExpense;

            return {
                name: m.name.substring(0, 3), // Jan, Feb...
                fullMonth: m.name,
                Income: mIncome,
                Expense: mExpense
            };
        });

        const pieData = Object.keys(categoryExpenses).map(key => ({
            name: key,
            value: categoryExpenses[key]
        })).sort((a, b) => b.value - a.value);

        return { totalIncome: income, totalExpense: expense, balance: income - expense, chartData: monthlyData, pieData };
    }, [data]);

    const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#6366f1', '#14b8a6', '#f43f5e'];

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
                {/* Income vs Expense Chart (Bar Chart) */}
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
                            <BarChart data={summary.chartData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
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
                                <Bar
                                    dataKey="Income"
                                    name="Ingresos"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                                <Bar
                                    dataKey="Expense"
                                    name="Gastos"
                                    fill="#f43f5e"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Expenses Breakdown (Pie Chart) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl shadow-black/20 flex flex-col"
                >
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
                        <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 border border-rose-500/30">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        Distribución de Gastos
                    </h3>
                    <div className="h-80 w-full relative">
                        {summary.pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {summary.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                                            backgroundColor: '#0f172a', // Solid dark background
                                            padding: '12px',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 600 }} // Explicit white text
                                        formatter={(value) => [`$${value.toLocaleString('es-CL')}`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Wallet className="w-12 h-12 mb-2 opacity-50" />
                                <p>No hay gastos registrados</p>
                            </div>
                        )}
                        {/* Centered Total or Label */}
                        {summary.pieData.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total</span>
                                <span className="text-xl font-bold text-white">${summary.totalExpense.toLocaleString('es-CL')}</span>
                            </div>
                        )}
                    </div>
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
            </div>
            <h3 className="text-slate-400 text-sm font-semibold tracking-wide uppercase relative z-10">{title}</h3>
            <p className="text-3xl font-bold mt-2 text-white tracking-tight relative z-10">
                ${amount.toLocaleString('es-CL')}
            </p>
        </motion.div>
    );
};

export default Dashboard;
