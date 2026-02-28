import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar, User, X, Pencil, ZoomIn, ZoomOut } from 'lucide-react';

const START_HOUR = 8;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
};

const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const durationToMinutes = (durationStr) => {
    if (!durationStr) return 45;
    if (durationStr.includes('hora')) return 60;
    if (durationStr.includes('min')) return parseInt(durationStr);
    return 45; // default
};

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const Schedule = () => {
    const { data, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry } = useFinance();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pixelsPerMinute, setPixelsPerMinute] = useState(1.5); // Nivel de zoom dinámico
    const [newEntry, setNewEntry] = useState({
        day: 'Lunes',
        time: '14:00',
        studentId: '',
        studentName: '',
        duration: '45 min'
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newEntry.studentName || !newEntry.time) return;

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
            studentId: item.studentId || '',
            studentName: item.studentName,
            duration: item.duration || '45 min'
        });
        setEditingId(item.id);
        setIsAdding(true);
    };

    // ----- Drag and Drop Logic -----
    const handleDragStart = (e, item) => {
        // Almacenamos el ID del item que se está arrastrando
        e.dataTransfer.setData('itemId', item.id);
        // Pequeño hack para Firefox
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necesario para permitir el drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDay) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('itemId');
        if (!itemId) return;

        // Calcular la coordenada Y dentro del contenedor del día
        const rect = e.currentTarget.getBoundingClientRect();
        // Le restamos el header sticky si calculamos dentro del wrapper, pero ya estamos en el contenedor con position relative debajo del header. Ojo, si onDrop está en el div general del día que incluye el header (top: 40px aprox):
        let offsetY = e.clientY - rect.top;

        // El header del día mide 40px de altura. Descontamos eso.
        offsetY -= 40;
        if (offsetY < 0) offsetY = 0;

        // Convertir offsetY a minutos en función del zoom (pixelsPerMinute)
        const droppedMinutesRel = Math.round(offsetY / pixelsPerMinute);

        // Sumar al inicio real (08:00)
        let totalMinutes = (START_HOUR * 60) + droppedMinutesRel;

        // Redondear al bloque de 15 minutos más cercano
        totalMinutes = Math.round(totalMinutes / 15) * 15;

        // Restringir a los límites [08:00 - 22:00]
        totalMinutes = Math.max(START_HOUR * 60, Math.min(totalMinutes, END_HOUR * 60 - 15));

        const newTimeStr = minutesToTime(totalMinutes);

        // Actualizar entrada
        updateScheduleEntry(itemId, { day: targetDay, time: newTimeStr });
    };

    // Render helpers
    const scheduleHeight = TOTAL_HOURS * 60 * pixelsPerMinute;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-100px)]">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                        <Calendar className="w-6 h-6" />
                    </div>
                    Horario Dinámico
                </h2>

                <div className="flex items-center gap-3">
                    {/* Controles de Zoom */}
                    <div className="flex items-center bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-lg">
                        <button
                            onClick={() => setPixelsPerMinute(Math.max(1, pixelsPerMinute - 0.5))}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            title="Reducir Zoom"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-200 w-10 text-center select-none">
                            {pixelsPerMinute}x
                        </span>
                        <button
                            onClick={() => setPixelsPerMinute(Math.min(4, pixelsPerMinute + 0.5))}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            title="Aumentar Zoom"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Añadir Manual
                    </button>
                </div>
            </div>

            {/* Calendar UI Wrapper */}
            <div className="flex-1 overflow-auto bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative custom-scrollbar">
                <div className="flex min-w-[900px] h-full">
                    {/* Regla Horaria (Y-axis) */}
                    <div className="w-16 flex-shrink-0 relative border-r border-white/5 bg-slate-950/80 sticky left-0 z-30">
                        {/* Espacio para el header de días */}
                        <div className="h-10 border-b border-white/5 sticky top-0 bg-slate-950 z-40"></div>

                        {/* Horas */}
                        <div className="relative" style={{ height: `${scheduleHeight}px` }}>
                            {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
                                const h = START_HOUR + i;
                                const top = (i * 60) * pixelsPerMinute;
                                return (
                                    <div
                                        key={h}
                                        className="absolute w-full text-right pr-3 flex flex-col justify-center select-none"
                                        style={{ top: `${top}px`, transform: 'translateY(-50%)' }}
                                    >
                                        <span className="text-[11px] font-mono tracking-tighter text-slate-400 font-bold bg-slate-950/80 px-1 rounded inline-block shadow-sm z-10">{String(h).padStart(2, '0')}:00</span>
                                        {i !== TOTAL_HOURS && <div className="absolute right-0 w-2 border-b border-white/10 top-1/2"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Columnas de Días */}
                    <div className="flex flex-1 relative">
                        {/* Líneas horizontales de fondo que abarcan todo el ancho */}
                        <div className="absolute inset-0 pointer-events-none mt-10">
                            {Array.from({ length: TOTAL_HOURS * 4 }).map((_, i) => {
                                // Dibujar cada cuartos de hora paramétrico
                                const isHour = i % 4 === 0;
                                return (
                                    <div
                                        key={i}
                                        className={`w-full absolute ${isHour ? 'border-b border-white/10' : 'border-b border-white/5 border-dashed opacity-30'}`}
                                        style={{ top: `${i * 15 * pixelsPerMinute}px` }}
                                    />
                                );
                            })}
                        </div>

                        {days.map(day => (
                            <div
                                key={day}
                                className="flex-1 border-r border-white/5 relative group/column min-w-[120px]"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, day)}
                            >
                                {/* Día Header */}
                                <div className="h-10 border-b border-white/10 flex items-center justify-center sticky top-0 bg-slate-900/95 backdrop-blur z-20 shadow-sm">
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{day}</span>
                                </div>

                                {/* Contenedor de bloques del día */}
                                <div className="relative w-full z-10" style={{ height: `${scheduleHeight}px` }}>
                                    {/* Drop indicator hover */}
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover/column:opacity-100 pointer-events-none transition-opacity"></div>

                                    {(data.schedule || []).filter(item => item.day === day).map(item => {
                                        const classStartMins = timeToMinutes(item.time) - (START_HOUR * 60);
                                        const classDurationMins = durationToMinutes(item.duration);

                                        const top = classStartMins * pixelsPerMinute;
                                        const height = classDurationMins * pixelsPerMinute;

                                        return (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                className="absolute left-1 right-1 rounded-lg bg-indigo-500/20 backdrop-blur-md border border-indigo-500/40 p-2 cursor-grab active:cursor-grabbing hover:bg-indigo-500/30 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.1)] overflow-hidden flex flex-col group/block hover:z-20 min-h-[30px]"
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                            >
                                                <div className="flex justify-between items-start gap-1">
                                                    <div className="text-[10px] font-mono font-bold text-indigo-300 leading-none bg-indigo-950/50 px-1 rounded-sm w-max inline-block shadow-sm border border-indigo-500/20">{item.time}</div>
                                                    {classDurationMins > 30 && (
                                                        <span className="text-[9px] text-indigo-400/70 font-mono tracking-tighter truncate">{item.duration}</span>
                                                    )}
                                                </div>
                                                <div className="font-bold text-white text-xs leading-tight mt-1.5 line-clamp-2 drop-shadow-md">
                                                    {item.studentName}
                                                </div>

                                                {/* Botones de acción on hover */}
                                                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity translate-x-2 group-hover/block:translate-x-0 duration-200">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                                                        className="p-1 bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-indigo-500 rounded-md shadow-lg"
                                                        title="Editar manual"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteScheduleEntry(item.id); }}
                                                        className="p-1 bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-rose-500 rounded-md shadow-lg"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Asignación / Edición (igual, pero modernizado) */}
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
                                    >
                                        <option value="">Ingresar Nombre Manualmente</option>
                                        {(data.studentDb || []).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {!newEntry.studentId && (
                                        <input
                                            type="text"
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            value={newEntry.studentName}
                                            onChange={e => setNewEntry({ ...newEntry, studentName: e.target.value })}
                                            required
                                        />
                                    )}
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
                                            type="time"
                                            step="900"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono [color-scheme:dark]"
                                            value={newEntry.time}
                                            onChange={e => setNewEntry({ ...newEntry, time: e.target.value })}
                                            required
                                        />
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
