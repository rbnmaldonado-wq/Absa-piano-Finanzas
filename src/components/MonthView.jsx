import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import PianoClassesTable from './PianoClassesTable';
import BudgetChart from './BudgetChart';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ArrowLeft, CreditCard,
    Tag, Wallet, X, Download, Pencil, CheckCircle, Clock, PiggyBank, Filter,
    Repeat, Users, Briefcase, Check, RotateCcw
} from 'lucide-react';

const MonthView = ({ monthIndex, onBack }) => {
    const {
        data,
        addTransaction,
        deleteTransaction,
        importTransactionsFromPreviousMonth,
        updateTransaction,
        addSaving,
        deleteSaving,
        getToday,
        updateMonthSalary
    } = useFinance();

    const monthData = data.months[monthIndex];
    const defaultSalary = Number(data.salarySettings?.defaultSalary || 0);
    const hasCustomSalary = monthData.salary !== null && monthData.salary !== undefined;
    const currentSalary = hasCustomSalary ? Number(monthData.salary) : defaultSalary;

    // Default to 'budget' as requested for personal financial planning focus
    const [activeTab, setActiveTab] = useState('budget'); // 'budget', 'expenses', 'savings', 'incomes', 'piano'
    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [tempSalary, setTempSalary] = useState(currentSalary.toString());

    const getDefaultDateForMonth = () => {
        const year = data.year || new Date().getFullYear();
        const mm = String(monthIndex + 1).padStart(2, '0');
        const today = getToday();
        const day = (today.getFullYear() === year && today.getMonth() === monthIndex)
            ? String(today.getDate()).padStart(2, '0')
            : '01';
        return `${year}-${mm}-${day}`;
    };

    const [isAdding, setIsAdding] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        description: '',
        amount: '',
        categoryId: '',
        subcategory: '',
        paymentMethodId: '',
        date: getDefaultDateForMonth(),
        isFixed: false
    });

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState([]);

    const hasActiveFilters = selectedCategoryIds.length > 0 || selectedPaymentMethodIds.length > 0;

    const activeTransactions = activeTab === 'expenses'
        ? [
            ...monthData.expenses,
            ...(monthData.savings || []).map(s => ({
                ...s,
                isSaving: true,
                status: 'Al día',
            }))
        ]
        : (activeTab === 'incomes' ? monthData.incomes : []);

    const filteredTransactions = activeTransactions.filter(tx => {
        const categoryMatch = selectedCategoryIds.length === 0 || selectedCategoryIds.includes(Number(tx.categoryId));
        const paymentMethodMatch = activeTab !== 'expenses' || selectedPaymentMethodIds.length === 0 || selectedPaymentMethodIds.includes(Number(tx.paymentMethodId));
        return categoryMatch && paymentMethodMatch;
    });

    const filteredTotal = filteredTransactions.reduce((acc, tx) => acc + Number(tx.amount), 0);

    const txStats = useMemo(() => {
        let paid = 0;
        let pending = 0;
        activeTransactions.forEach(tx => {
            if (tx.status === 'Al día') {
                paid += Number(tx.amount || 0);
            } else {
                pending += Number(tx.amount || 0);
            }
        });
        return { paid, pending, total: paid + pending };
    }, [activeTransactions]);

    const getMonthSummary = () => {
        const otherIncomes = monthData.incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalExpenses = monthData.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalSavings = (monthData.savings || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalPersonalIncome = currentSalary + otherIncomes;

        return {
            income: totalPersonalIncome,
            expense: totalExpenses + totalSavings,
            balance: totalPersonalIncome - (totalExpenses + totalSavings),
            savings: totalSavings,
            salary: currentSalary,
            otherIncomes
        };
    };

    const summary = getMonthSummary();

    // New saving form state
    const [newSaving, setNewSaving] = useState({
        description: '',
        amount: '',
        type: 'ahorro',
        paymentMethodId: '',
        date: getDefaultDateForMonth()
    });
    const [isAddingSaving, setIsAddingSaving] = useState(false);

    const handleAddSaving = (e) => {
        e.preventDefault();
        if (!newSaving.amount) return;
        addSaving(monthIndex, newSaving);
        setNewSaving({
            description: '',
            amount: '',
            type: 'ahorro',
            paymentMethodId: '',
            date: getDefaultDateForMonth()
        });
        setIsAddingSaving(false);
    };

    const handleSaveSalary = (e) => {
        e.preventDefault();
        const numeric = Number(tempSalary);
        if (!isNaN(numeric) && numeric >= 0) {
            updateMonthSalary(monthIndex, numeric);
        }
        setIsEditingSalary(false);
    };

    const handleResetSalaryToBase = () => {
        updateMonthSalary(monthIndex, null);
        setTempSalary(defaultSalary.toString());
        setIsEditingSalary(false);
    };

    const handleAddTransaction = (e) => {
        e.preventDefault();
        if (!newTransaction.amount || !newTransaction.categoryId) return;

        const type = activeTab === 'expenses' ? 'expense' : 'income';
        let targetMonthIndex = monthIndex;

        if (type === 'expense' && newTransaction.paymentMethodId) {
            const method = data.paymentMethods?.find(m => m.id == newTransaction.paymentMethodId);
            if (method && method.type === 'credit' && method.cutoffDate) {
                const parts = newTransaction.date.split('-');
                const txMonth = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);

                let billingMonthIndex = txMonth;
                if (day >= method.cutoffDate) {
                    billingMonthIndex = txMonth + 1;
                }

                if (billingMonthIndex !== monthIndex) {
                    if (billingMonthIndex < 12) {
                        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                        const targetMonthName = monthNames[billingMonthIndex];
                        const confirmNextMonth = window.confirm(`La fecha de este gasto indica que corresponde al ciclo de ${targetMonthName} (corte los días ${method.cutoffDate}).\n\n¿Deseas registrar este gasto automáticamente en ${targetMonthName}?`);
                        if (confirmNextMonth) {
                            targetMonthIndex = billingMonthIndex;
                        }
                    } else {
                        window.alert(`La fecha indica que corresponde al próximo ciclo según tu tarjeta, pero pertenece al próximo año fiscal. El gasto se guardará en el mes seleccionado.`);
                    }
                }
            }
        }

        addTransaction(targetMonthIndex, type, newTransaction);
        setNewTransaction({
            description: '',
            amount: '',
            categoryId: '',
            subcategory: '',
            paymentMethodId: '',
            date: getDefaultDateForMonth(),
            isFixed: false
        });
        setIsAdding(false);
    };

    const categories = (data.categories || []).filter(c =>
        activeTab === 'expenses' ? c.type === 'expense' : c.type === 'income'
    );

    return (
        <div className="space-y-6">
            {/* Top Bar with Month Name and Back button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 rounded-2xl bg-slate-900/40 hover:bg-white/10 border border-white/5 transition-colors text-slate-400 hover:text-white"
                        title="Volver al Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {monthData.name} {data.year}
                        </h2>
                        <p className="text-xs text-slate-400">Planificación mensual y presupuesto</p>
                    </div>
                </div>

                {/* Director Salary Badge & Quick Edit Button */}
                <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 px-4 py-2.5 rounded-2xl shadow-lg">
                    <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Sueldo Director
                            </span>
                            {hasCustomSalary ? (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Ajuste de mes
                                </span>
                            ) : (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                    Base
                                </span>
                            )}
                        </div>
                        <p className="text-base font-bold text-white font-mono">
                            ${currentSalary.toLocaleString('es-CL')}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setTempSalary(currentSalary.toString());
                            setIsEditingSalary(!isEditingSalary);
                        }}
                        className="ml-2 p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Ajustar sueldo para este mes"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* In-place salary adjustment modal / popover */}
            <AnimatePresence>
                {isEditingSalary && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                        <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-indigo-400" />
                                Modificar Sueldo para {monthData.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Puedes ingresar el monto exacto recibido este mes (sueldo base, bonos o descuentos).
                            </p>
                        </div>
                        <form onSubmit={handleSaveSalary} className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative">
                                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="number"
                                    className="pl-8 pr-3 py-2 w-44 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={tempSalary}
                                    onChange={(e) => setTempSalary(e.target.value)}
                                    placeholder="Ej: 1500000"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                            >
                                <Check className="w-4 h-4" /> Guardar
                            </button>
                            {hasCustomSalary && (
                                <button
                                    type="button"
                                    onClick={handleResetSalaryToBase}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition-all flex items-center gap-1.5"
                                    title="Volver al sueldo base predeterminado"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Sueldo Base (${defaultSalary.toLocaleString('es-CL')})
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsEditingSalary(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Month Summary Cards (Personal Finance KPI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 relative z-10">Ingresos (Sueldo)</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-2 relative z-10 font-mono">
                        ${summary.income.toLocaleString('es-CL')}
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </p>
                </div>
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1 relative z-10">Gastos Totales</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-2 relative z-10 font-mono">
                        ${summary.expense.toLocaleString('es-CL')}
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                    </p>
                </div>
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1 relative z-10">Ahorro / Inversión</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-2 relative z-10 font-mono">
                        ${summary.savings.toLocaleString('es-CL')}
                        <PiggyBank className="w-4 h-4 text-teal-400" />
                    </p>
                </div>
                <div className="relative p-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 relative z-10">Balance Neto</p>
                    <p className={`text-2xl font-bold flex items-center gap-2 relative z-10 font-mono ${summary.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        ${summary.balance.toLocaleString('es-CL')}
                        <Wallet className="w-4 h-4 text-indigo-400" />
                    </p>
                </div>
            </div>

            {/* Navigation Tabs (Prioritizing Financial Planning) */}
            <div className="flex gap-2 p-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl w-fit flex-wrap shadow-xl">
                {[
                    { id: 'budget', label: '📊 Presupuesto 50/30/20' },
                    { id: 'expenses', label: 'Gastos' },
                    { id: 'savings', label: '💰 Ahorro / Deuda' },
                    { id: 'incomes', label: 'Sueldo e Ingresos' },
                    { id: 'piano', label: '🎹 Alumnos (Academia)' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'budget' ? (
                    <BudgetChart monthIndex={monthIndex} />
                ) : activeTab === 'piano' ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3 text-xs text-indigo-300">
                            <Users className="w-5 h-5 text-indigo-400 shrink-0" />
                            <span>
                                <strong>Gestión de la Academia:</strong> Las clases y alumnos registrados aquí sirven para control docente y de cobros de la academia, pero <strong>no se suman a tus ingresos personales</strong> (los cuales provienen de tu sueldo de director).
                            </span>
                        </div>
                        <PianoClassesTable monthIndex={monthIndex} />
                    </div>
                ) : activeTab === 'savings' ? (
                    /* Savings Tab */
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-2xl shadow-black/20">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl border bg-teal-500/20 text-teal-400 border-teal-500/30">
                                    <PiggyBank className="w-5 h-5" />
                                </div>
                                Ahorro, Deudas e Inversión
                            </h3>
                            <button
                                onClick={() => setIsAddingSaving(!isAddingSaving)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg ${isAddingSaving
                                    ? 'bg-slate-800 text-slate-300 border border-white/5'
                                    : 'bg-teal-600 text-white hover:bg-teal-500 shadow-teal-500/20'}`}
                            >
                                {isAddingSaving ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isAddingSaving ? 'Cancelar' : 'Agregar Ahorro'}
                            </button>
                        </div>

                        {isAddingSaving && (
                            <form onSubmit={handleAddSaving} className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-950/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                                <input
                                    type="date"
                                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                    value={newSaving.date}
                                    onChange={e => setNewSaving({ ...newSaving, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Descripción"
                                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                    value={newSaving.description}
                                    onChange={e => setNewSaving({ ...newSaving, description: e.target.value })}
                                />
                                <select
                                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                    value={newSaving.type}
                                    onChange={e => setNewSaving({ ...newSaving, type: e.target.value })}
                                >
                                    <option value="ahorro">💰 Ahorro</option>
                                    <option value="deuda">💳 Pago de Deuda</option>
                                    <option value="inversion">📈 Inversión</option>
                                </select>
                                <select
                                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                                    value={newSaving.paymentMethodId}
                                    onChange={e => setNewSaving({ ...newSaving, paymentMethodId: e.target.value })}
                                >
                                    <option value="">Medio de Pago</option>
                                    {(data.paymentMethods || []).map(method => (
                                        <option key={method.id} value={method.id}>{method.name}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Monto"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all font-mono"
                                        value={newSaving.amount}
                                        onChange={e => setNewSaving({ ...newSaving, amount: e.target.value })}
                                        required
                                    />
                                    <button type="submit" className="px-5 bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-all font-bold shadow-lg shadow-teal-500/20">
                                        OK
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {(monthData.savings || []).length === 0 && (
                                <div className="text-center py-12">
                                    <PiggyBank className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400">No hay registros de ahorro.</p>
                                    <p className="text-slate-500 text-sm mt-1">Agrega tu primer ahorro, amortización de deuda o inversión.</p>
                                </div>
                            )}
                            {(monthData.savings || []).map((saving, idx) => {
                                const typeLabels = { ahorro: '💰 Ahorro', deuda: '💳 Deuda', inversion: '📈 Inversión' };
                                const typeColors = { ahorro: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', deuda: 'bg-amber-500/10 text-amber-400 border-amber-500/30', inversion: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
                                const paymentMethod = data.paymentMethods?.find(m => m.id == saving.paymentMethodId);
                                return (
                                    <div key={saving.id || idx} className="flex justify-between items-center p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[11px] text-slate-500 font-mono bg-slate-950/50 px-2.5 py-1 rounded-lg border border-white/5">
                                                {saving.date ? saving.date.split('-').reverse().join('/') : '-'}
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${typeColors[saving.type] || typeColors.ahorro}`}>
                                                {typeLabels[saving.type] || '💰 Ahorro'}
                                            </div>
                                            <p className="font-bold text-slate-200">{saving.description || 'Sin descripción'}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                                <span className="font-bold text-white text-lg font-mono">
                                                    ${Number(saving.amount).toLocaleString('es-CL')}
                                                </span>
                                                {paymentMethod && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide shadow-sm ${paymentMethod.color}`}>
                                                        {paymentMethod.name}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteSaving(monthIndex, saving.id)}
                                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Savings Total */}
                        {(monthData.savings || []).length > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-400">Total Ahorro del Mes</span>
                                <span className="text-xl font-bold text-teal-400 font-mono">
                                    ${summary.savings.toLocaleString('es-CL')}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Incomes and Expenses Tabs */
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-2xl shadow-black/20">
                        {/* If in Incomes tab, show Director Salary hero banner */}
                        {activeTab === 'incomes' && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 via-slate-900/60 to-purple-500/10 rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                            Ingreso Principal
                                        </span>
                                        <h4 className="text-xl font-bold text-white">Sueldo Director</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {hasCustomSalary
                                                ? `Ajustado especialmente para ${monthData.name}`
                                                : `Usando sueldo base predeterminado ($${defaultSalary.toLocaleString('es-CL')})`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-white font-mono">
                                        ${currentSalary.toLocaleString('es-CL')}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setTempSalary(currentSalary.toString());
                                            setIsEditingSalary(true);
                                        }}
                                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Ajustar
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${activeTab === 'expenses' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                    {activeTab === 'expenses' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                </div>
                                {activeTab === 'expenses' ? 'Registro de Gastos' : 'Otros Ingresos Adicionales'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto justify-end">
                                {hasActiveFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.15)] h-[42px]"
                                    >
                                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider hidden sm:inline">Total Filtrado:</span>
                                        <span className="text-sm text-indigo-400 font-bold font-mono whitespace-nowrap">${filteredTotal.toLocaleString('es-CL')}</span>
                                    </motion.div>
                                )}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold border h-[42px] ${showFilters || hasActiveFilters
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                            : 'bg-slate-800/50 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span className="hidden sm:inline">Filtrar</span>
                                        {hasActiveFilters && (
                                            <span className="flex items-center justify-center w-5 h-5 bg-indigo-500 text-white text-[10px] rounded-full shadow-md">
                                                {selectedCategoryIds.length + selectedPaymentMethodIds.length}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsAdding(!isAdding)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg h-[42px] ${isAdding
                                            ? 'bg-slate-800 text-slate-300 border border-white/5'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                                            }`}
                                    >
                                        {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{isAdding ? 'Cancelar' : (activeTab === 'expenses' ? 'Agregar Gasto' : 'Agregar Ingreso')}</span>
                                    </button>
                                </div>

                                {monthIndex > 0 && activeTab === 'expenses' && (
                                    <button
                                        onClick={() => {
                                            const count = importTransactionsFromPreviousMonth(monthIndex, 'expense');
                                            if (count > 0) {
                                                alert(`Se importaron ${count} gastos fijos del mes pasado.`);
                                            } else {
                                                alert("No hay gastos fijos nuevos para importar del mes pasado.");
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/5 h-[42px]"
                                        title="Importar gastos fijos del mes anterior"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Importar Gastos Fijos</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/20 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 border-l-4 border-l-emerald-500/50 flex items-center justify-between shadow-lg shadow-black/20">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        Pagados / Realizados
                                    </p>
                                    <p className="text-2xl lg:text-3xl font-bold text-white font-mono">${txStats.paid.toLocaleString('es-CL')}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 border-l-4 border-l-amber-500/50 flex items-center justify-between shadow-lg shadow-black/20">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        Pendientes
                                    </p>
                                    <p className="text-2xl lg:text-3xl font-bold text-white font-mono">${txStats.pending.toLocaleString('es-CL')}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                    <DollarSign className="w-6 h-6 opacity-70" />
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 border-l-4 border-l-indigo-500/50 flex items-center justify-between shadow-lg shadow-black/20">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                        {activeTab === 'expenses' ? 'Total Gastos' : 'Otros Ingresos'}
                                    </p>
                                    <p className="text-2xl lg:text-3xl font-bold text-white font-mono">${txStats.total.toLocaleString('es-CL')}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Interactive Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mb-8 overflow-hidden"
                                >
                                    <div className="bg-slate-950/40 p-6 rounded-2xl border border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Filter className="w-4 h-4 text-indigo-400" />
                                                    Filtros Activos
                                                </h4>
                                                {hasActiveFilters && (
                                                    <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                                                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Total Filtrado:</span>
                                                        <span className="text-sm text-indigo-400 font-bold font-mono">${filteredTotal.toLocaleString('es-CL')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategoryIds([]);
                                                        setSelectedPaymentMethodIds([]);
                                                    }}
                                                    className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Limpiar Todo
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Categories Filter */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                    <Tag className="w-3 h-3" /> CATEGORÍAS
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {categories.map(cat => {
                                                        const isSelected = selectedCategoryIds.includes(cat.id);
                                                        return (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => {
                                                                    setSelectedCategoryIds(prev =>
                                                                        isSelected ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                                                                    );
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected
                                                                    ? `${cat.color} text-white border-transparent shadow-lg`
                                                                    : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-slate-700'
                                                                    }`}
                                                            >
                                                                {cat.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Payment Methods Filter */}
                                            {activeTab === 'expenses' && (
                                                <div className="space-y-3">
                                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                        <CreditCard className="w-3 h-3" /> MEDIOS DE PAGO
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {data.paymentMethods.map(method => {
                                                            const isSelected = selectedPaymentMethodIds.includes(method.id);
                                                            return (
                                                                <button
                                                                    key={method.id}
                                                                    onClick={() => {
                                                                        setSelectedPaymentMethodIds(prev =>
                                                                            isSelected ? prev.filter(id => id !== method.id) : [...prev, method.id]
                                                                        );
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected
                                                                        ? `${method.color} text-white border-transparent shadow-lg`
                                                                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-slate-700'
                                                                        }`}
                                                                >
                                                                    {method.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add Transaction Form */}
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
                                        <div className="flex gap-2">
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
                                            <label className={`flex items-center gap-2 px-3 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'w-full' : 'w-auto'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 focus:ring-1"
                                                    checked={newTransaction.isFixed}
                                                    onChange={e => setNewTransaction({ ...newTransaction, isFixed: e.target.checked })}
                                                />
                                                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                                                    <Repeat className="w-3.5 h-3.5 text-indigo-400" /> Fijo Mensual
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-dashed border-white/5">
                                    <Filter className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-400">No se encontraron registros con los filtros seleccionados.</p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => {
                                                setSelectedCategoryIds([]);
                                                setSelectedPaymentMethodIds([]);
                                            }}
                                            className="text-indigo-400 text-sm font-bold mt-2 hover:text-indigo-300 transition-colors"
                                        >
                                            Limpiar filtros para ver todo
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredTransactions.map((tx, idx) => {
                                    if (tx.isSaving) {
                                        return (
                                            <SavingRow
                                                key={tx.id || idx}
                                                tx={tx}
                                                paymentMethods={data.paymentMethods || []}
                                            />
                                        );
                                    }
                                    return (
                                        <TransactionRow
                                            key={tx.id || idx}
                                            tx={tx}
                                            type={activeTab === 'expenses' ? 'expense' : 'income'}
                                            categories={data.categories || []}
                                            paymentMethods={data.paymentMethods || []}
                                            onUpdate={(updates) => updateTransaction(monthIndex, activeTab === 'expenses' ? 'expense' : 'income', tx.id, updates)}
                                            onDelete={() => deleteTransaction(monthIndex, activeTab === 'expenses' ? 'expense' : 'income', tx.id)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// Standalone SavingRow to ensure no conditional Hook violation
const SavingRow = ({ tx, paymentMethods }) => {
    const paymentMethod = paymentMethods.find(m => m.id == tx.paymentMethodId);
    const typeLabels = { ahorro: '💰 Ahorro', deuda: '💳 Deuda', inversion: '📈 Inversión' };
    const typeColors = {
        ahorro: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        deuda: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        inversion: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    };

    return (
        <div className="flex justify-between items-center p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5 bg-teal-500/5 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="text-[11px] text-slate-500 font-mono bg-slate-950/50 px-2.5 py-1 rounded-lg border border-white/5">
                    {tx.date ? tx.date.split('-').reverse().join('/') : '-'}
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${typeColors[tx.type] || typeColors.ahorro}`}>
                    {typeLabels[tx.type] || '💰 Ahorro'}
                </div>
                <p className="font-bold text-slate-200">{tx.description || 'Sin descripción'}</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                    <span className="font-bold text-white text-lg font-mono">
                        ${Number(tx.amount).toLocaleString('es-CL')}
                    </span>
                    {paymentMethod && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide shadow-sm ${paymentMethod.color}`}>
                            {paymentMethod.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const TransactionRow = ({ tx, type, categories, paymentMethods, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        description: tx.description || '',
        amount: tx.amount || '',
        categoryId: tx.categoryId || '',
        subcategory: tx.subcategory || '',
        paymentMethodId: tx.paymentMethodId || '',
        date: tx.date || new Date().toISOString().split('T')[0],
        status: tx.status || 'Pendiente',
        paymentDate: tx.paymentDate || null,
        isFixed: tx.isFixed || false
    });

    const category = categories.find(c => c.id == tx.categoryId);
    const paymentMethod = paymentMethods.find(m => m.id == tx.paymentMethodId);

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    const toggleStatus = () => {
        const newStatus = tx.status === 'Pendiente' ? 'Al día' : 'Pendiente';
        let paymentDate = null;

        if (newStatus === 'Al día') {
            const todayDate = new Date();
            const dd = String(todayDate.getDate()).padStart(2, '0');
            const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
            const yyyy = todayDate.getFullYear();
            const todayFormatted = `${dd}/${mm}/${yyyy}`;

            let defaultPromptValue = todayFormatted;
            if (tx.paymentDate) {
                const parts = tx.paymentDate.split('-');
                if (parts.length === 3) defaultPromptValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }

            const promptedDate = window.prompt("Ingrese la fecha de pago para confirmar (DD/MM/AAAA):", defaultPromptValue);
            if (promptedDate === null) return;

            let finalIsoDate = `${yyyy}-${mm}-${dd}`;
            if (promptedDate.trim() !== '') {
                const parts = promptedDate.split(/[\/\-\.\s]/);
                if (parts.length === 3) {
                    let d = parts[0].padStart(2, '0');
                    let m = parts[1].padStart(2, '0');
                    let y = parts[2];
                    if (y.length === 2) y = '20' + y;
                    if (y.length === 4) finalIsoDate = `${y}-${m}-${d}`;
                }
            }
            paymentDate = finalIsoDate;
        }
        onUpdate({ status: newStatus, paymentDate });
    };

    if (isEditing) {
        return (
            <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/20 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold px-1">Fecha</label>
                        <input
                            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs"
                            type="date"
                            value={editData.date}
                            onChange={e => setEditData({ ...editData, date: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold px-1">Descripción</label>
                        <input
                            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs"
                            value={editData.description}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold px-1">Monto</label>
                        <input
                            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs font-mono"
                            type="number"
                            value={editData.amount}
                            onChange={e => setEditData({ ...editData, amount: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                        className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs"
                        value={editData.categoryId}
                        onChange={e => setEditData({ ...editData, categoryId: e.target.value })}
                    >
                        <option value="">Categoría</option>
                        {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {type === 'expense' && (
                        <select
                            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs"
                            value={editData.paymentMethodId}
                            onChange={e => setEditData({ ...editData, paymentMethodId: e.target.value })}
                        >
                            <option value="">Medio de Pago</option>
                            {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    )}
                    <label className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                        <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                            checked={editData.isFixed}
                            onChange={e => setEditData({ ...editData, isFixed: e.target.checked })}
                        />
                        <span className="text-xs font-medium text-slate-300">Fijo / Mensual</span>
                    </label>
                    <div className="flex justify-end gap-2 items-center">
                        <button onClick={handleSave} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"><CheckCircle className="w-5 h-5" /></button>
                        <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500 hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="text-[11px] text-slate-500 font-mono bg-slate-950/50 px-2.5 py-1 rounded-lg border border-white/5">
                        {tx.date ? tx.date.split('-').reverse().join('/') : '-'}
                    </div>
                    {tx.paymentDate && (
                        <div className="text-[9px] font-bold text-slate-600 bg-slate-950/30 px-1.5 py-0.5 rounded border border-white/5">
                            Pagado: {tx.paymentDate.split('-').reverse().join('/')}
                        </div>
                    )}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${category?.color || 'bg-slate-400'}`}>
                    <Tag className="w-4 h-4" />
                </div>
                <div>
                    <p className="font-bold text-slate-200">{tx.description || category?.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>{category?.name}</span>
                        {tx.subcategory && (
                            <>
                                <span>•</span>
                                <span>{tx.subcategory}</span>
                            </>
                        )}
                        {tx.isFixed && (
                            <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded ml-2 border border-indigo-500/20">
                                <Repeat className="w-3 h-3" /> Fijo Mensual
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                    <span className="font-bold text-white text-lg font-mono">
                        ${Number(tx.amount).toLocaleString('es-CL')}
                    </span>
                    {paymentMethod && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide shadow-sm ${paymentMethod.color}`}>
                            {paymentMethod.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleStatus}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-lg active:scale-95 tracking-widest ${tx.status === 'Al día'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            }`}
                    >
                        {tx.status === 'Al día' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {tx.status === 'Al día' ? 'PAID' : 'PENDING'}
                    </button>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={onDelete} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthView;
