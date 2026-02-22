import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CreditCard, Wallet, Landmark, Plus, Trash2, Tag, ChevronDown, Check, X, Database, Download, Upload, TriangleAlert, RefreshCw, Edit2, ShoppingBag, TrendingUp } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
    const { data, addPaymentMethod, deletePaymentMethod, addCategory, addSubcategory, updateCategory, deleteCategory, deleteSubcategory, loadData, startNewYear } = useFinance();
    const [activeTab, setActiveTab] = useState('categories');

    return (

        <div className="space-y-8 relative">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Configuración</h2>

                {/* Tabs - Glass Style */}
                <div className="flex gap-2 p-1.5 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl w-fit mb-8 shadow-2xl shadow-black/20">
                    <button
                        onClick={() => setActiveTab('paymentMethods')}
                        className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === 'paymentMethods'
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        Medios de Pago
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === 'categories'
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        Categorías y Subcategorías
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === 'data'
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        Gestión de Datos
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'paymentMethods' ? (
                        <motion.div
                            key="paymentMethods"
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <PaymentMethodsManager
                                paymentMethods={data.paymentMethods || []}
                                onAdd={addPaymentMethod}
                                onDelete={deletePaymentMethod}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <CategoriesManager
                                categories={data.categories}
                                onAddCategory={addCategory}
                                onAddSubcategory={addSubcategory}
                                onUpdateCategory={updateCategory}
                                onDeleteCategory={deleteCategory}
                                onDeleteSubcategory={deleteSubcategory}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'data' && (
                        <motion.div
                            key="data"
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <DataManagement
                                data={data}
                                onLoadData={loadData}
                                onStartNewYear={startNewYear}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PaymentMethodsManager = ({ paymentMethods, onAdd, onDelete }) => {
    const [newMethod, setNewMethod] = useState({ name: '', type: 'credit', color: 'bg-indigo-500' });

    const handleAdd = (e) => {
        e.preventDefault();
        onAdd(newMethod);
        setNewMethod({ name: '', type: 'credit', color: 'bg-indigo-500' });
    };

    const colors = [
        "bg-slate-500", "bg-red-500", "bg-orange-500", "bg-amber-500",
        "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500",
        "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500",
        "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
        "bg-pink-500", "bg-rose-500"
    ];

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* List - Deep Glass Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Wallet className="w-5 h-5" />
                    </div>
                    Mis Tarjetas y Cuentas
                </h3>
                <div className="space-y-4 relative z-10">
                    {paymentMethods.map(method => (
                        <div key={method.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group/item shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] ${method.color}`}>
                                    {method.type === 'credit' && <CreditCard className="w-6 h-6" />}
                                    {method.type === 'debit' && <Landmark className="w-6 h-6" />}
                                    {method.type === 'cash' && <Wallet className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-100">{method.name}</p>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{method.type === 'credit' ? 'Crédito' : method.type === 'debit' ? 'Débito' : 'Efectivo'}</p>
                                </div>
                            </div>
                            <button onClick={() => onDelete(method.id)} className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Form - Deep Glass Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 h-fit relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Plus className="w-5 h-5" />
                    </div>
                    Agregar Nuevo Medio
                </h3>
                <form onSubmit={handleAdd} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: Visa Falabella"
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                            value={newMethod.name}
                            onChange={e => setNewMethod({ ...newMethod, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                            value={newMethod.type}
                            onChange={e => setNewMethod({ ...newMethod, type: e.target.value })}
                        >
                            <option value="credit">Tarjeta de Crédito</option>
                            <option value="debit">Débito / Cuenta Vista</option>
                            <option value="cash">Efectivo</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Color Distintivo</label>
                        <div className="flex flex-wrap gap-3">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewMethod({ ...newMethod, color })}
                                    className={`w-8 h-8 rounded-full ${color} transition-all hover:scale-110 hover:shadow-[0_0_10px_currentColor] ${newMethod.color === color ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 shadow-[0_0_15px_currentColor]' : 'opacity-70 hover:opacity-100'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 font-bold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 mt-2">
                        Agregar Medio de Pago
                    </button>
                </form>
            </div>
        </div>
    );
};

const CategoriesManager = ({ categories, onAddCategory, onAddSubcategory, onUpdateCategory, onDeleteCategory, onDeleteSubcategory }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', type: 'expense', color: 'bg-indigo-500', budgetBand: 'estiloVida' });

    const handleAdd = (e) => {
        e.preventDefault();
        onAddCategory(newCat);
        setNewCat({ name: '', type: 'expense', color: 'bg-indigo-500', budgetBand: 'estiloVida' });
        setIsAdding(false);
    };

    const colors = [
        "bg-slate-500", "bg-red-500", "bg-orange-500", "bg-amber-500",
        "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500",
        "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500",
        "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
        "bg-pink-500", "bg-rose-500"
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
                        <Tag className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Categorías de Gastos</h3>
                        <p className="text-xs text-slate-400">Organiza tus registros con categorías personalizadas</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg ${isAdding ? 'bg-slate-800 text-slate-400 border border-white/10' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30'}`}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Cancelar' : 'Nueva Categoría'}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleAdd} className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] gap-6 grid grid-cols-1 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre de la Categoría</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Suscripciones"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                                        value={newCat.name}
                                        onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Color Distintivo</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewCat({ ...newCat, color })}
                                                className={`w-7 h-7 rounded-full ${color} transition-all hover:scale-110 ${newCat.color === color ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 shadow-[0_0_10px_currentColor]' : 'opacity-70 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                                    Crear Categoría
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6 md:grid-cols-2">
                {categories.filter(c => c.type === 'expense').map(category => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onAddSubcategory={onAddSubcategory}
                        onUpdateCategory={onUpdateCategory}
                        onDeleteCategory={onDeleteCategory}
                        onDeleteSubcategory={onDeleteSubcategory}
                    />
                ))}
            </div>
        </div>
    );
};

const CategoryCard = ({ category, onAddSubcategory, onUpdateCategory, onDeleteCategory, onDeleteSubcategory }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(category.name);
    const [newSub, setNewSub] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newSub.trim()) {
            onAddSubcategory(category.id, newSub.trim());
            setNewSub('');
        }
    };

    const handleSaveName = (e) => {
        e.stopPropagation();
        if (editedName.trim() && editedName !== category.name) {
            onUpdateCategory(category.id, { name: editedName });
        }
        setIsEditing(false);
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditedName(category.name);
        setIsEditing(false);
    };

    const handleDeleteCategory = (e) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Esto no se puede deshacer.`)) {
            onDeleteCategory(category.id);
        }
    };

    const handleDeleteSubcategory = (sub) => {
        if (window.confirm(`¿Eliminar subcategoría "${sub}"?`)) {
            onDeleteSubcategory(category.id, sub);
        }
    };

    return (
        <div className={`
            bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-all duration-300 group/card overflow-hidden
            ${isExpanded ? 'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5 hover:border-white/10 hover:bg-slate-800/40'}
        `}>
            <div
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 cursor-pointer relative"
            >
                {/* Subtle Inner Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color.replace('bg-', 'from-')}/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                <div className="flex items-center gap-4 flex-1 relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10`}>
                        <Tag className="w-5 h-5" />
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 mr-4" onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 rounded-lg border border-indigo-500/50 bg-slate-950/80 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                autoFocus
                            />
                            <button onClick={handleSaveName} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                <Check className="w-5 h-5" />
                            </button>
                            <button onClick={handleCancelEdit} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 group flex-1">
                            <span className="font-bold text-slate-100 text-lg tracking-tight">{category.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                title="Editar nombre"
                            >
                                <Edit2 className="w-4 h-4" />

                            </button>
                            {/* Budget Band Toggle */}
                            <div className="flex items-center gap-1 ml-auto" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => onUpdateCategory(category.id, { budgetBand: 'basicos' })}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${category.budgetBand === 'basicos'
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                                            : 'bg-white/5 text-slate-500 border border-white/5 hover:border-indigo-500/30 hover:text-indigo-400'
                                        }`}
                                    title="Gasto Básico (50%)"
                                >
                                    <ShoppingBag className="w-3 h-3" />
                                    Básico
                                </button>
                                <button
                                    onClick={() => onUpdateCategory(category.id, { budgetBand: 'estiloVida' })}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${category.budgetBand === 'estiloVida' || !category.budgetBand
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                                            : 'bg-white/5 text-slate-500 border border-white/5 hover:border-purple-500/30 hover:text-purple-400'
                                        }`}
                                    title="Estilo de Vida (30%)"
                                >
                                    <TrendingUp className="w-3 h-3" />
                                    Estilo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <div className="flex items-center gap-2 relative z-10">
                        <button
                            onClick={handleDeleteCategory}
                            className="opacity-0 group-hover/card:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all mr-2"
                            title="Eliminar categoría"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <div className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`}>
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-950/30 border-t border-white/5"
                    >
                        <div className="p-5 pt-3">
                            <div className="flex flex-wrap gap-3 mb-6 mt-2">
                                {(category.subcategories || []).map((sub, idx) => (
                                    <div key={idx} className="group/chip relative flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-slate-900/50 rounded-full border border-white/10 overflow-hidden transition-all hover:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                                        {/* Colored Glow Background */}
                                        <div className={`absolute inset-0 ${category.color} opacity-[0.08] group-hover/chip:opacity-20 transition-opacity duration-300`}></div>

                                        <span className="relative z-10 text-xs font-semibold text-slate-300 group-hover/chip:text-white transition-colors tracking-wide">
                                            {sub}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteSubcategory(sub)}
                                            className="relative z-10 p-0.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded-full opacity-0 group-hover/chip:opacity-100 transition-all ml-1"
                                            title="Eliminar subcategoría"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {(category.subcategories || []).length === 0 && (
                                    <div className="text-sm text-slate-500 italic py-2 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                        No hay subcategorías definidas
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleAdd} className="flex gap-2 relative">
                                <input
                                    type="text"
                                    placeholder="Nueva subcategoría..."
                                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-900/60 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none placeholder:text-slate-600 transition-all"
                                    value={newSub}
                                    onChange={e => setNewSub(e.target.value)}
                                />
                                <button type="submit" className="px-4 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl hover:bg-indigo-600 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DataManagement = ({ data, onLoadData, onStartNewYear }) => {
    const fileInputRef = React.useRef(null);
    const [importError, setImportError] = useState(null);

    const handleDownload = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `finance_data_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const newData = JSON.parse(event.target.result);
                // Basic validation
                if (!newData.months || !newData.categories) {
                    throw new Error("Formato de archivo inválido");
                }
                if (window.confirm("¿Estás seguro de que deseas reemplazar los datos actuales con este respaldo? Esta acción no se puede deshacer.")) {
                    onLoadData(newData);
                    alert("Datos cargados correctamente.");
                }
            } catch (err) {
                setImportError("Error al leer el archivo. Asegúrate de que es un respaldo válido.");
                console.error(err);
            }
        };
        reader.readAsText(file);
        e.target.value = null; // Reset input
    };

    const handleNewYear = () => {
        if (window.confirm("ATENCIÓN: Esto iniciará un nuevo año fiscal.\n\n1. Se generará un respaldo automático de tus datos actuales.\n2. Se borrarán todos los registros mensuales (ingresos, gastos, clases).\n3. Se mantendrán tus alumnos, categorías y configuraciones.\n\n¿Deseas continuar?")) {
            handleDownload(); // Auto backup
            setTimeout(() => {
                onStartNewYear();
                alert("¡Feliz Año Nuevo! Los registros han sido reiniciados.");
            }, 1000);
        }
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Backup & Restore */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Database className="w-5 h-5" />
                    </div>
                    Respaldo y Restauración
                </h3>

                <div className="space-y-6 relative z-10">
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Descarga una copia de seguridad de tus datos para mantenerlos seguros o transferirlos a otro dispositivo.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-white/10 transition-all hover:scale-[1.02] shadow-lg group/btn"
                        >
                            <Download className="w-5 h-5 text-indigo-400 group-hover/btn:text-white transition-colors" />
                            <span>Descargar Respaldo JSON</span>
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold border border-white/5 border-dashed hover:border-indigo-500/50 transition-all hover:scale-[1.02]"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Cargar Respaldo</span>
                            </button>
                        </div>
                        {importError && (
                            <p className="text-rose-400 text-xs text-center">{importError}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* New Year Zone */}
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-rose-500/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
                    <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        <TriangleAlert className="w-5 h-5" />
                    </div>
                    Zona de Peligro: Nuevo Año
                </h3>

                <div className="space-y-6 relative z-10">
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Utiliza esta opción al iniciar un nuevo año fiscal. Esta acción <span className="text-white font-bold">borrará todos los registros mensuales</span> (ingresos, gastos, clases) pero mantendrá tu base de datos de alumnos, categorías y configuración.
                    </p>

                    <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                        <p className="text-rose-300 text-xs font-bold flex gap-2 items-start">
                            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                            Se descargará automáticamente un respaldo antes de borrar los datos.
                        </p>
                    </div>

                    <button
                        onClick={handleNewYear}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold shadow-lg shadow-rose-900/20 transition-all hover:scale-[1.02]"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Iniciar Nuevo Año</span>
                    </button>

                    <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        Acción Irreversible
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
