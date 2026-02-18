
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Clock, User, DollarSign, Users, XCircle, Pencil, Timer } from 'lucide-react';

const PianoClassesTable = ({ monthIndex }) => {
    const { data, addPianoClass, updatePianoClass, deletePianoClass, importStudentsToMonth } = useFinance();
    const classes = data.months[monthIndex].pianoClasses || [];

    const [isAdding, setIsAdding] = useState(false);
    const [newClass, setNewClass] = useState({
        studentName: '',
        rate: 35000,
        count: 4,
        duration: '45 min',
        status: 'Pendiente'
    });

    const handleImport = () => {
        const count = importStudentsToMonth(monthIndex);
        if (count > 0) {
            alert(`Se importaron ${count} alumnos activos.`);
        } else {
            alert("No hay alumnos nuevos para importar o la base de datos está vacía.");
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const total = Number(newClass.rate) * Number(newClass.count);
        addPianoClass(monthIndex, { ...newClass, total });
        setNewClass({ studentName: '', rate: 35000, count: 4, duration: '45 min', status: 'Pendiente' });
        setIsAdding(false);
    };

    const toggleStatus = (cls) => {
        const newStatus = cls.status === 'Pendiente' ? 'Al día' : 'Pendiente';
        const paymentDate = newStatus === 'Al día' ? new Date().toISOString().split('T')[0] : null;
        updatePianoClass(monthIndex, cls.id, { status: newStatus, paymentDate });
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <User className="w-5 h-5" />
                        </div>
                        Clases de Piano
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 ml-1">Gestiona tus alumnos y pagos mensuales</p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                        title="Importar alumnos activos desde la base de datos"
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Cargar Alumnos</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg ${isAdding
                            ? 'bg-slate-800 text-slate-400 border border-white/10'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                            }`}
                    >
                        {isAdding ? <><XCircle className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nuevo Alumno</>}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAdd}
                        className="p-6 bg-slate-950/40 border-b border-white/5 grid grid-cols-1 md:grid-cols-12 gap-6"
                    >
                        <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre Alumno</label>
                            <input
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                                value={newClass.studentName}
                                onChange={e => setNewClass({ ...newClass, studentName: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Clase</label>
                            <div className="relative">
                                <DollarSign className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="number"
                                    placeholder="35000"
                                    className="pl-10 px-4 py-3 w-full rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                                    value={newClass.rate}
                                    onChange={e => setNewClass({ ...newClass, rate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cant. Clases</label>
                            <input
                                type="number"
                                placeholder="4"
                                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                value={newClass.count}
                                onChange={e => setNewClass({ ...newClass, count: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duración</label>
                            <div className="relative">
                                <Timer className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                <select
                                    className="pl-10 px-4 py-3 w-full rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                                    value={newClass.duration}
                                    onChange={e => setNewClass({ ...newClass, duration: e.target.value })}
                                >
                                    <option value="20 min">20 min</option>
                                    <option value="30 min">30 min</option>
                                    <option value="45 min">45 min</option>
                                    <option value="1 hora">1 hora</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-12 flex justify-end">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95"
                            >
                                Guardar Alumno
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/50 text-slate-500 font-bold uppercase tracking-widest text-[10px] border-b border-white/5">
                        <tr>
                            <th className="px-8 py-4">Alumno</th>
                            <th className="px-6 py-4">Detalle</th>
                            <th className="px-6 py-4">Total Mensual</th>
                            <th className="px-6 py-4">Fecha Pago</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-8 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {classes.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4 py-8">
                                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 border border-white/5">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <p className="text-slate-400 font-medium">No hay clases registradas este mes.</p>
                                        <button onClick={handleImport} className="px-6 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-all font-bold">
                                            Cargar alumnos activos
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            classes.map((cls, idx) => (
                                <ClassRow
                                    key={cls.id || idx}
                                    cls={cls}
                                    onUpdate={(updates) => updatePianoClass(monthIndex, cls.id, updates)}
                                    onDelete={() => deletePianoClass(monthIndex, cls.id)}
                                    onToggleStatus={() => toggleStatus(cls)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ClassRow = ({ cls, onUpdate, onDelete, onToggleStatus }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        studentName: cls.studentName,
        rate: cls.rate,
        count: cls.count,
        duration: cls.duration || '1 hora',
        paymentDate: cls.paymentDate || ''
    });

    const handleSave = () => {
        const total = Number(editData.rate) * Number(editData.count);
        onUpdate({ ...editData, total });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <tr className="bg-indigo-500/5">
                <td className="px-8 py-4">
                    <div className="space-y-2">
                        <input
                            className="w-full px-3 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            value={editData.studentName}
                            onChange={e => setEditData({ ...editData, studentName: e.target.value })}
                            autoFocus
                        />
                        <select
                            className="w-full px-3 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={editData.duration}
                            onChange={e => setEditData({ ...editData, duration: e.target.value })}
                        >
                            <option value="20 min">20 min</option>
                            <option value="30 min">30 min</option>
                            <option value="45 min">45 min</option>
                            <option value="1 hora">1 hora</option>
                        </select>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            className="w-16 px-2 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white text-center outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={editData.count}
                            onChange={e => setEditData({ ...editData, count: e.target.value })}
                        />
                        <span className="text-slate-600 font-bold">x</span>
                        <input
                            type="number"
                            className="w-24 px-2 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white text-right outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={editData.rate}
                            onChange={e => setEditData({ ...editData, rate: e.target.value })}
                        />
                    </div>
                </td>
                <td className="px-6 py-4 font-bold text-white">
                    ${(Number(editData.rate) * Number(editData.count)).toLocaleString('es-CL')}
                </td>
                <td className="px-6 py-4">
                    <input
                        type="date"
                        className="px-2 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={editData.paymentDate}
                        onChange={e => setEditData({ ...editData, paymentDate: e.target.value })}
                    />
                </td>
                <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2 py-1 rounded-full">Editando</span>
                </td>
                <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Guardar">
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500 hover:bg-white/5 rounded-lg transition-all" title="Cancelar">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group hover:bg-white/5 transition-colors border-b border-white/5"
        >
            <td className="px-8 py-5">
                <div className="font-bold text-white text-base tracking-tight">
                    {cls.studentName}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-xs font-semibold">
                    <Timer className="w-3.5 h-3.5" />
                    {cls.duration || '1 hora'}
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 text-[11px] font-bold text-slate-400 border border-white/5">
                    <span>{cls.count} clases</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono">${Number(cls.rate).toLocaleString('es-CL')}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="font-bold text-white text-base tracking-tight">
                    ${Number(cls.total).toLocaleString('es-CL')}
                </div>
            </td>
            <td className="px-6 py-5">
                {cls.paymentDate ? (
                    <div className="text-[10px] font-bold font-mono text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-white/5 w-fit">
                        {cls.paymentDate}
                    </div>
                ) : (
                    <span className="text-slate-700">-</span>
                )}
            </td>
            <td className="px-6 py-5">
                <button
                    onClick={onToggleStatus}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-lg active:scale-95 tracking-widest ${cls.status === 'Al día'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}
                >
                    {cls.status === 'Al día' ? (
                        <>
                            <CheckCircle className="w-3.5 h-3.5" /> PAID
                        </>
                    ) : (
                        <>
                            <Clock className="w-3.5 h-3.5" /> PENDING
                        </>
                    )}
                </button>
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title="Editar"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

export default PianoClassesTable;
