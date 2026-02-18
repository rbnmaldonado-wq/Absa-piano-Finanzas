
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Check, Search, User, Plus, X, Pencil, Trash2 } from 'lucide-react';

const SIIData = () => {
    const { data, addStudentToDb, updateStudentInDb, deleteStudentInDb } = useFinance();
    const students = data.studentDb || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        fullName: '',
        address: '',
        phone: '',
        email: '',
        defaultRate: 35000
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newStudent.name) return;
        addStudentToDb(newStudent);
        setNewStudent({ name: '', fullName: '', address: '', phone: '', email: '', defaultRate: 35000 });
        setIsAdding(false);
    };

    const handleCopy = (text, id, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(`${id}-${field}`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.fullName && s.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                            <FileText className="w-5 h-5" />
                        </div>
                        Módulo SII
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 ml-1">Facturación y datos de alumnos</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold shadow-lg whitespace-nowrap ${isAdding
                            ? 'bg-slate-800 text-slate-300 border border-white/10'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                            }`}
                    >
                        {isAdding ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nuevo</>}
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
                        className="p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Nombre Corto</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950/50 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="Ej: Juan P."
                                    required
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Nombre Completo (SII)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950/50 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="Nombre oficial para boleta"
                                    value={newStudent.fullName}
                                    onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Dirección</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950/50 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="Dirección SII"
                                    value={newStudent.address}
                                    onChange={e => setNewStudent({ ...newStudent, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950/50 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                                    placeholder="+56 9..."
                                    value={newStudent.phone}
                                    onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">E-mail</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950/50 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="ejemplo@correo.com"
                                    value={newStudent.email}
                                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pr-1">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                Guardar Alumno
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="bg-slate-950/30 backdrop-blur-2xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alumno</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facturación / Contacto</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center">
                                        <User className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                        <p className="text-slate-500 text-sm">No hay registros</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <SIIRow
                                        key={student.id}
                                        student={student}
                                        onUpdate={(updates) => updateStudentInDb(student.id, updates)}
                                        onDelete={() => deleteStudentInDb(student.id)}
                                        onCopy={handleCopy}
                                        copiedId={copiedId}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SIIRow = ({ student, onUpdate, onDelete, onCopy, copiedId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullName: student.fullName || '',
        address: student.address || '',
        phone: student.phone || '',
        email: student.email || ''
    });

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group hover:bg-white/[0.02] transition-colors"
        >
            <td className="px-6 py-4 vertical-top pt-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white tracking-tight leading-none">{student.name}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${student.active ? 'text-emerald-500' : 'text-slate-600'}`}>
                            {student.active ? 'Activo' : 'Inactivo'}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {isEditing ? (
                        <>
                            <EditField label="Nombre Completo" value={editData.fullName} onChange={v => setEditData({ ...editData, fullName: v })} />
                            <EditField label="Dirección" value={editData.address} onChange={v => setEditData({ ...editData, address: v })} />
                            <EditField label="Teléfono" value={editData.phone} onChange={v => setEditData({ ...editData, phone: v })} />
                            <EditField label="E-mail" value={editData.email} onChange={v => setEditData({ ...editData, email: v })} />
                        </>
                    ) : (
                        <>
                            <DataField label="Nombre SII" value={student.fullName} id={student.id} field="fullName" onCopy={onCopy} copiedId={copiedId} />
                            <DataField label="Dirección" value={student.address} id={student.id} field="address" onCopy={onCopy} copiedId={copiedId} />
                            <DataField label="Teléfono" value={student.phone} id={student.id} field="phone" onCopy={onCopy} copiedId={copiedId} />
                            <DataField label="E-mail" value={student.email} id={student.id} field="email" onCopy={onCopy} copiedId={copiedId} />
                        </>
                    )}
                </div>
            </td>

            <td className="px-6 py-4 text-right vertical-top pt-5">
                <div className="flex justify-end gap-1.5">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

const EditField = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter block">{label}</label>
        <input
            type="text"
            className="w-full px-2 py-1 bg-slate-950/60 border border-indigo-500/30 rounded-lg text-white text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const DataField = ({ label, value, id, field, onCopy, copiedId }) => {
    const isCopied = copiedId === `${id}-${field}`;

    return (
        <div className="space-y-0.5 relative">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter block">{label}</label>
            <div
                onClick={() => value && onCopy(value, id, field)}
                className={`flex items-center justify-between gap-2 transition-all cursor-pointer group/field ${value ? 'hover:text-indigo-400' : 'opacity-40 cursor-not-allowed'}`}
            >
                <span className={`text-[11px] truncate font-medium ${value ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                    {value || 'Sin dato'}
                </span>
                {value && (
                    <div className={`p-0.5 rounded transition-all ${isCopied ? 'bg-emerald-500/20' : 'opacity-0 group-hover/field:opacity-100'}`}>
                        {isCopied ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                            <Copy className="w-2.5 h-2.5 text-slate-500" />
                        )}
                    </div>
                )}
            </div>
            {isCopied && (
                <motion.span
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute -right-12 top-0 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20"
                >
                    Copied!
                </motion.span>
            )}
        </div>
    );
};

export default SIIData;
