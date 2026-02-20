
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar, User, X, Pencil } from 'lucide-react';

const Schedule = () => {
    const { data, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry } = useFinance();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newEntry, setNewEntry] = useState({
        day: 'Lunes',
        time: '14:00',
        studentId: '',
        studentName: '',
        duration: '45 min'
    });

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const timeSlots = [];
    for (let i = 8; i <= 21; i++) {
        ['00', '15', '30', '45'].forEach(min => {
            timeSlots.push(`${String(i).padStart(2, '0')}:${min}`);
        });
    }

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newEntry.studentName || !newEntry.time) return;

        // Find student name if ID is selected
        let finalName = newEntry.studentName;
        if (newEntry.studentId) {
            const student = data.studentDb.find(s => s.id == newEntry.studentId);
            if (student) finalName = student.name;
        }

        if (editingId) {
            updateScheduleEntry(editingId, { ...newEntry, studentName: finalName });
        } else {
            addScheduleEntry({ ...newEntry, studentName: finalName });
        }

        setNewEntry({ day: 'Lunes', time: '14:00', studentId: '', studentName: '', duration: '45 min' });
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (item) => {
        setNewEntry({
            day: item.day,
            time: item.time,
            studentId: item.studentId,
            studentName: item.studentName,
            duration: item.duration || '45 min'
        });
        setEditingId(item.id);
        setIsAdding(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                        <Calendar className="w-6 h-6" />
                    </div>
                    Horario de Clases
                </h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Asignar Horario
                </button>
            </div>

            {/* Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map(day => (
                    <div key={day} className="space-y-4">
                        <div className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl text-center">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{day}</h3>
                        </div>
                        <div className="space-y-3">
                            {(data.schedule || [])
                                .filter(item => item.day === day)
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative group p-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-xs font-mono text-slate-400">{item.time}</span>
                                        </div>
                                        <p className="font-bold text-slate-200 text-sm leading-tight">{item.studentName}</p>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                                                {item.duration || '45 min'}
                                            </span>
                                        </div>

                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="p-1.5 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => deleteScheduleEntry(item.id)}
                                                className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            {(data.schedule || []).filter(item => item.day === day).length === 0 && (
                                <div className="py-8 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Libre</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <User className="w-6 h-6 text-indigo-400" />
                                {editingId ? 'Editar Clase' : 'Asignar Clase'}
                            </h3>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alumno</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        value={newEntry.studentId}
                                        onChange={e => {
                                            const student = data.studentDb.find(s => s.id == e.target.value);
                                            setNewEntry({ ...newEntry, studentId: e.target.value, studentName: student ? student.name : '' });
                                        }}
                                        required
                                    >
                                        <option value="">Seleccionar Alumno</option>
                                        {data.studentDb.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Día</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            value={newEntry.day}
                                            onChange={e => setNewEntry({ ...newEntry, day: e.target.value })}
                                        >
                                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hora</label>
                                        <input
                                            type="text"
                                            list="time-slots"
                                            placeholder="HH:MM"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                                            value={newEntry.time}
                                            onChange={e => setNewEntry({ ...newEntry, time: e.target.value })}
                                            required
                                        />
                                        <datalist id="time-slots">
                                            {timeSlots.map(t => <option key={t} value={t} />)}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duración</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            value={newEntry.duration}
                                            onChange={e => setNewEntry({ ...newEntry, duration: e.target.value })}
                                        >
                                            <option value="20 min">20 min</option>
                                            <option value="30 min">30 min</option>
                                            <option value="45 min">45 min</option>
                                            <option value="1 hora">1 hora</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setEditingId(null);
                                            setNewEntry({ day: 'Lunes', time: '14:00', studentId: '', studentName: '', duration: '45 min' });
                                        }}
                                        className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all border border-white/5"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        {editingId ? 'Guardar Cambios' : 'Confirmar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedule;
