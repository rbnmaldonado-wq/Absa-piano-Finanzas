import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Clock, User, DollarSign, Users, XCircle, Pencil, Timer, CheckSquare, Square } from 'lucide-react';

const PianoClassesTable = ({ monthIndex }) => {
    const { data, addPianoClass, updatePianoClass, deletePianoClass, importStudentsToMonth, importSpecificStudents } = useFinance();
    const classes = data.months[monthIndex].pianoClasses || [];
    const allStudents = data.studentDb || [];

    const [isAdding, setIsAdding] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Students available for import (active and not already in this month)
    const availableStudents = useMemo(() => {
        return allStudents.filter(s =>
            s.active &&
            !classes.some(c => c.studentId == s.id || c.studentName === s.name)
        );
    }, [allStudents, classes]);

    // Group classes by family
    const groupedClasses = useMemo(() => {
        const groups = {};
        const noFamily = [];

        classes.forEach(cls => {
            if (cls.family && cls.family.trim() !== '') {
                const familyName = cls.family.trim();
                if (!groups[familyName]) {
                    groups[familyName] = [];
                }
                groups[familyName].push(cls);
            } else {
                noFamily.push(cls);
            }
        });

        // Sort families alphabetically
        const sortedGroups = Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {});

        return { groups: sortedGroups, noFamily };
    }, [classes]);

    const [newClass, setNewClass] = useState({
        studentName: '',
        rate: 35000,
        count: 4,
        duration: '45 min',
        status: 'Pendiente',
        family: ''
    });

    const handleImportAll = () => {
        const count = importStudentsToMonth(monthIndex);
        if (count > 0) {
            alert(`Se importaron ${count} alumnos activos.`);
        } else {
            alert("No hay alumnos nuevos para importar.");
        }
    };

    const handleOpenImportModal = () => {
        setSelectedStudents([]); // Reset selection
        setIsImportModalOpen(true);
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const confirmImportSelection = () => {
        if (selectedStudents.length > 0) {
            importSpecificStudents(monthIndex, selectedStudents);
        }
        setIsImportModalOpen(false);
        setSelectedStudents([]);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const total = Number(newClass.rate) * Number(newClass.count);
        addPianoClass(monthIndex, { ...newClass, total });
        setNewClass({ studentName: '', rate: 35000, count: 4, duration: '45 min', status: 'Pendiente', family: '' });
        setIsAdding(false);
    };

    const toggleStatus = (cls) => {
        const newStatus = cls.status === 'Pendiente' ? 'Al día' : 'Pendiente';
        let paymentDate = null;

        if (newStatus === 'Al día') {
            const todayDate = new Date();
            const dd = String(todayDate.getDate()).padStart(2, '0');
            const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
            const yyyy = todayDate.getFullYear();
            const todayFormatted = `${dd}/${mm}/${yyyy}`;

            // Use existing date as default if available
            let defaultPromptValue = todayFormatted;
            if (cls.paymentDate) {
                const parts = cls.paymentDate.split('-');
                if (parts.length === 3) {
                    // Assuming YYYY-MM-DD
                    defaultPromptValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const promptedDate = window.prompt("Ingrese la fecha de pago para confirmar (DD/MM/AAAA):", defaultPromptValue);

            if (promptedDate === null) {
                // User cancelled the prompt, do not change status
                return;
            }

            // Default to ISO today if empty
            let finalIsoDate = `${yyyy}-${mm}-${dd}`;

            if (promptedDate.trim() !== '') {
                // Parse DD/MM/YYYY using various separators: / - . or space
                const parts = promptedDate.split(/[\/\-\.\s]/);
                if (parts.length === 3) {
                    let d = parts[0].padStart(2, '0');
                    let m = parts[1].padStart(2, '0');
                    let y = parts[2];

                    // Handle short year
                    if (y.length === 2) y = '20' + y;

                    // Simple validation: DD/MM/YYYY logic or YYYY/MM/DD logic
                    if (y.length === 4 && d.length <= 2 && m.length <= 2) {
                        // We expect DD/MM/YYYY
                        finalIsoDate = `${y}-${m}-${d}`;
                    } else if (d.length === 4 && m.length <= 2 && y.length <= 2) {
                        // We got YYYY/MM/DD
                        finalIsoDate = `${d}-${m}-${y.padStart(2, '0')}`;
                    }
                }
            }

            paymentDate = finalIsoDate;
        }

        updatePianoClass(monthIndex, cls.id, { status: newStatus, paymentDate });
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-black/20 relative">

            {/* Import Selection Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isImportModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setIsImportModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-400" />
                                        Seleccionar Alumnos
                                    </h3>
                                    <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                                    {availableStudents.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <p>No hay alumnos disponibles para importar.</p>
                                            <p className="text-xs mt-1">Todos los alumnos activos ya están en la lista de este mes.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {availableStudents.map(student => (
                                                <div
                                                    key={student.id}
                                                    onClick={() => toggleStudentSelection(student.id)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedStudents.includes(student.id)
                                                        ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                                        : 'bg-slate-950/50 border-white/5 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedStudents.includes(student.id) ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold ${selectedStudents.includes(student.id) ? 'text-white' : 'text-slate-300'}`}>{student.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono">${Number(student.defaultRate).toLocaleString('es-CL')}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`p-1 rounded-full ${selectedStudents.includes(student.id) ? 'text-indigo-400' : 'text-slate-600'}`}>
                                                        {selectedStudents.includes(student.id) ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-white/5 bg-slate-900 sticky bottom-0 z-10 flex justify-between items-center gap-4">
                                    <div className="text-sm text-slate-400">
                                        <span className="font-bold text-white">{selectedStudents.length}</span> seleccionados
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsImportModalOpen(false)}
                                            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={confirmImportSelection}
                                            disabled={selectedStudents.length === 0}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Importar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

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
                <div className="flex flex-wrap gap-2 relative z-10">
                    <button
                        onClick={handleOpenImportModal}
                        className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all text-sm font-bold border border-white/10"
                        title="Seleccionar alumnos específicos"
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Seleccionar</span>
                    </button>
                    <button
                        onClick={handleImportAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-bold border border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                        title="Importar TODOS los alumnos activos"
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Cargar Todo</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg ${isAdding
                            ? 'bg-slate-800 text-slate-400 border border-white/10'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                            }`}
                    >
                        {isAdding ? <><XCircle className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nuevo</>}
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
                        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 mb-2">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Agrupación Familiar (Opcional)</label>
                                <div className="relative">
                                    <Users className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/30 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Ej: Familia González"
                                        value={newClass.family}
                                        onChange={e => setNewClass({ ...newClass, family: e.target.value })}
                                    />
                                </div>
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
                                        <div className="flex gap-4">
                                            <button onClick={handleOpenImportModal} className="px-6 py-2 bg-slate-800 text-slate-300 border border-white/10 rounded-xl hover:bg-slate-700 transition-all font-bold">
                                                Seleccionar
                                            </button>
                                            <button onClick={handleImportAll} className="px-6 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-all font-bold">
                                                Cargar Todo
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <>
                                {/* Render Families */}
                                {Object.entries(groupedClasses.groups).map(([familyName, familyMembers]) => {
                                    const familyTotal = familyMembers.reduce((sum, cls) => sum + Number(cls.total), 0);
                                    return (
                                        <React.Fragment key={familyName}>
                                            <tr className="bg-slate-900/80 border-b border-white/5">
                                                <td colSpan="2" className="px-8 py-4">
                                                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm uppercase tracking-wider">
                                                        <Users className="w-5 h-5 text-indigo-400" />
                                                        {familyName}
                                                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full normal-case tracking-normal">
                                                            {familyMembers.length} alumnos
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 border-l border-white/5 bg-slate-900/50">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Familia</span>
                                                        <div className="font-bold text-emerald-400 text-base font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg inline-block shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                            ${familyTotal.toLocaleString('es-CL')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td colSpan="3" className="bg-slate-900/50"></td>
                                            </tr>
                                            {familyMembers.map((cls, idx) => (
                                                <ClassRow
                                                    key={cls.id || idx}
                                                    cls={cls}
                                                    onUpdate={(updates) => updatePianoClass(monthIndex, cls.id, updates)}
                                                    onDelete={() => deletePianoClass(monthIndex, cls.id)}
                                                    onToggleStatus={() => toggleStatus(cls)}
                                                />
                                            ))}
                                        </React.Fragment>
                                    );
                                })}

                                {/* Render Individual Students */}
                                {groupedClasses.noFamily.length > 0 && (
                                    <>
                                        {Object.keys(groupedClasses.groups).length > 0 && (
                                            <tr className="bg-slate-900/80 border-b border-white/5">
                                                <td colSpan="6" className="px-8 py-4">
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider">
                                                        <User className="w-4 h-4" />
                                                        Individuales
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {groupedClasses.noFamily.map((cls, idx) => (
                                            <ClassRow
                                                key={cls.id || idx}
                                                cls={cls}
                                                onUpdate={(updates) => updatePianoClass(monthIndex, cls.id, updates)}
                                                onDelete={() => deletePianoClass(monthIndex, cls.id)}
                                                onToggleStatus={() => toggleStatus(cls)}
                                            />
                                        ))}
                                    </>
                                )}
                            </>
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
        paymentDate: cls.paymentDate ? cls.paymentDate.split('-').reverse().join('/') : '',
        family: cls.family || ''
    });

    const handleSave = () => {
        const total = Number(editData.rate) * Number(editData.count);

        // Parse DD/MM/AAAA to YYYY-MM-DD
        let finalIsoDate = null;
        if (editData.paymentDate && editData.paymentDate.trim() !== '') {
            const parts = editData.paymentDate.split(/[\/\-\.\s]/);
            if (parts.length === 3) {
                let d = parts[0].padStart(2, '0');
                let m = parts[1].padStart(2, '0');
                let y = parts[2];
                if (y.length === 2) y = '20' + y;
                if (y.length === 4) {
                    finalIsoDate = `${y}-${m}-${d}`;
                }
            }
        }

        onUpdate({ ...editData, paymentDate: finalIsoDate, total });
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
                            placeholder="Nombre del Alumno"
                        />
                        <div className="relative">
                            <Users className="w-3 h-3 absolute left-2 top-2.5 text-slate-500" />
                            <input
                                className="w-full pl-7 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/50 text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                value={editData.family}
                                onChange={e => setEditData({ ...editData, family: e.target.value })}
                                placeholder="Familia (Opcional)"
                            />
                        </div>
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
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Fecha Pago</label>
                        <input
                            type="text"
                            placeholder="DD/MM/AAAA"
                            className="px-3 py-2 w-36 rounded-lg border border-indigo-500/30 bg-slate-950 text-white text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                            value={editData.paymentDate}
                            onChange={e => setEditData({ ...editData, paymentDate: e.target.value })}
                        />
                    </div>
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
                    <div className="text-sm font-bold font-mono text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-indigo-500/20 w-fit shadow-lg shadow-indigo-500/5">
                        {cls.paymentDate.split('-').reverse().join('/')}
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
