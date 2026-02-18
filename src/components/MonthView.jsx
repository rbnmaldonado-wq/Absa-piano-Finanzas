
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import PianoClassesTable from './PianoClassesTable';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ArrowLeft, CreditCard, Tag, Wallet, X } from 'lucide-react';

const MonthView = ({ monthIndex, onBack }) => {
    const { data, addTransaction, deleteTransaction } = useFinance();
    const monthData = data.months[monthIndex];

    const [activeTab, setActiveTab] = useState('piano'); // 'piano', 'incomes', 'expenses'
    const [isAdding, setIsAdding] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        categoryId: '',
        subcategory: '',
        paymentMethodId: '',
        date: new Date().toISOString().split('T')[0]
    });

    const getMonthSummary = () => {
        const pianoTotal = monthData.pianoClasses.reduce((acc, curr) => acc + Number(curr.total), 0);
        const otherIncomes = monthData.incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalExpenses = monthData.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        return {
            income: pianoTotal + otherIncomes,
            expense: totalExpenses,
            balance: (pianoTotal + otherIncomes) - totalExpenses
        };
    };

    const summary = getMonthSummary();

    const handleAddTransaction = (e) => {
        e.preventDefault();
        if (!newTransaction.amount || !newTransaction.categoryId) return;

        const type = activeTab === 'expenses' ? 'expense' : 'income';
        addTransaction(monthIndex, type, newTransaction);
        setNewTransaction({
            description: '',
            amount: '',
            categoryId: '',
            subcategory: '',
            paymentMethodId: '',
            date: new Date().toISOString().split('T')[0]
        });
        setIsAdding(false);
    };

    // Use categories from context only
    const categories = (data.categories || []).filter(c =>
        activeTab === 'expenses' ? c.type === 'expense' : c.type === 'income'
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-white">{monthData.name}</h2>
            </div>

            {/* Month Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 relative z-10">Ingresos</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-2 relative z-10">
                        ${summary.income.toLocaleString('es-CL')}
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </p>
                </div>
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1 relative z-10">Gastos</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-2 relative z-10">
                        ${summary.expense.toLocaleString('es-CL')}
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                    </p>
                </div>
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 relative z-10">Balance</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-2 relative z-10">
                        ${summary.balance.toLocaleString('es-CL')}
                        <Wallet className="w-4 h-4 text-indigo-400" />
                    </p>
                </div>
            </div>

            {/* Tabs - Glass Style */}
            <div className="flex gap-2 p-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl w-fit">
                {['piano', 'expenses', 'incomes'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === tab
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {tab === 'piano' && 'Clases de Piano'}
                        {tab === 'expenses' && 'Gastos'}
                        {tab === 'incomes' && 'Otros Ingresos'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'piano' ? (
                    <PianoClassesTable monthIndex={monthIndex} />
                ) : (
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-2xl shadow-black/20">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${activeTab === 'expenses' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                    {activeTab === 'expenses' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                </div>
                                {activeTab === 'expenses' ? 'Registro de Gastos' : 'Otros Ingresos'}
                            </h3>
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg ${isAdding
                                    ? 'bg-slate-800 text-slate-300 border border-white/5'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
                            >
                                {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isAdding ? 'Cancelar' : 'Agregar'}
                            </button>
                        </div>

                        {isAdding && (
                            <form onSubmit={handleAddTransaction} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                                <input
                                    type="date"
                                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    value={newTransaction.date}
                                    onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Descripción"
                                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        value={newTransaction.categoryId}
                                        onChange={e => setNewTransaction({ ...newTransaction, categoryId: e.target.value, subcategory: '' })}
                                        required
                                    >
                                        <option value="">Categoría</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>

                                    {newTransaction.categoryId && categories.find(c => c.id == newTransaction.categoryId)?.subcategories?.length > 0 && (
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            value={newTransaction.subcategory}
                                            onChange={e => setNewTransaction({ ...newTransaction, subcategory: e.target.value })}
                                        >
                                            <option value="">Subcategoría (Opcional)</option>
                                            {categories.find(c => c.id == newTransaction.categoryId).subcategories.map((sub, idx) => (
                                                <option key={idx} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Monto"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                                                value={newTransaction.amount}
                                                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                                required
                                            />
                                            <button type="submit" className="px-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-bold shadow-lg shadow-indigo-500/20">
                                                OK
                                            </button>
                                        </div>
                                        {activeTab === 'expenses' && (
                                            <select
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                value={newTransaction.paymentMethodId}
                                                onChange={e => setNewTransaction({ ...newTransaction, paymentMethodId: e.target.value })}
                                            >
                                                <option value="">Medio de Pago</option>
                                                {(data.paymentMethods || []).map(method => (
                                                    <option key={method.id} value={method.id}>{method.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {(activeTab === 'expenses' ? monthData.expenses : monthData.incomes).length === 0 && (
                                <p className="text-center text-slate-400 py-8">No hay registros.</p>
                            )}
                            {(activeTab === 'expenses' ? monthData.expenses : monthData.incomes).map((tx, idx) => {
                                const category = (data.categories || []).find(c => c.id == tx.categoryId);
                                const paymentMethod = (data.paymentMethods || []).find(m => m.id == tx.paymentMethodId);

                                return (
                                    <div key={tx.id || idx} className="flex justify-between items-center p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-slate-500 font-mono bg-slate-950/50 px-2.5 py-1 rounded-lg border border-white/5">
                                                {tx.date || 'Sin fecha'}
                                            </div>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${category?.color || 'bg-slate-400'}`}>
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">{tx.description || category?.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                                    <span>{category?.name}</span>
                                                    {tx.subcategory && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-slate-500 dark:text-slate-400">{tx.subcategory}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="font-bold text-white text-lg">
                                                ${Number(tx.amount).toLocaleString('es-CL')}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {paymentMethod && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide shadow-sm ${paymentMethod.color}`}>
                                                        {paymentMethod.name}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => deleteTransaction(monthIndex, activeTab === 'expenses' ? 'expense' : 'income', tx.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MonthView;
