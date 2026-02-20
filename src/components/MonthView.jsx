
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import PianoClassesTable from './PianoClassesTable';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ArrowLeft, CreditCard, Tag, Wallet, X, Download, Pencil, CheckCircle, Clock } from 'lucide-react';

const MonthView = ({ monthIndex, onBack }) => {
    const { data, addTransaction, deleteTransaction, importTransactionsFromPreviousMonth, updateTransaction } = useFinance();
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
                            {monthIndex > 0 && (
                                <button
                                    onClick={() => {
                                        const count = importTransactionsFromPreviousMonth(monthIndex, activeTab === 'expenses' ? 'expense' : 'income');
                                        if (count > 0) {
                                            // Optional: toast or alert
                                        } else {
                                            alert("No hay registros nuevos para importar del mes pasado.");
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/5 ml-2"
                                    title="Importar registros del mes pasado"
                                >
                                    <Download className="w-4 h-4" />
                                    Importar {activeTab === 'expenses' ? 'Gastos' : 'Ingresos'}
                                </button>
                            )}
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
                            {(activeTab === 'expenses' ? monthData.expenses : monthData.incomes).map((tx, idx) => (
                                <TransactionRow
                                    key={tx.id || idx}
                                    tx={tx}
                                    type={activeTab === 'expenses' ? 'expense' : 'income'}
                                    categories={data.categories || []}
                                    paymentMethods={data.paymentMethods || []}
                                    onUpdate={(updates) => updateTransaction(monthIndex, activeTab === 'expenses' ? 'expense' : 'income', tx.id, updates)}
                                    onDelete={() => deleteTransaction(monthIndex, activeTab === 'expenses' ? 'expense' : 'income', tx.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
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
        paymentDate: tx.paymentDate || null
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
                            type="text"
                            placeholder="DD/MM/AAAA"
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
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                    <span className="font-bold text-white text-lg">
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
