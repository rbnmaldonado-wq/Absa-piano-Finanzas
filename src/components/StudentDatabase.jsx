import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, DollarSign, CheckCircle, XCircle, Users, Clock, Home } from 'lucide-react';

const StudentDatabase = () => {
    const { data, addStudentToDb, updateStudentInDb, deleteStudentInDb } = useFinance();
    const students = data.studentDb || [];

    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        fullName: '',
        address: '',
        rut: '',
        email: '',
        rut: '',
        email: '',
        defaultRate: 35000,
        rut: '',
        email: '',
        defaultRate: 35000,
        duration: '1 hora',
        family: ''
    });

    // Group students by family
    const groupedStudents = React.useMemo(() => {
        const groups = {};
        const noFamily = [];

        students.forEach(student => {
            if (student.family && student.family.trim() !== '') {
                const familyName = student.family.trim();
                if (!groups[familyName]) {
                    groups[familyName] = [];
                }
                groups[familyName].push(student);
            } else {
                noFamily.push(student);
            }
        });

        // Sort families alphabetically
        const sortedGroups = Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {});

        return { groups: sortedGroups, noFamily };
    }, [students]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newStudent.name || !newStudent.defaultRate) return;
        addStudentToDb(newStudent);
        setNewStudent({ name: '', fullName: '', address: '', rut: '', email: '', defaultRate: 35000, duration: '1 hora', family: '' });
        setIsAdding(false);
    };

    const toggleActive = (student) => {
        updateStudentInDb(student.id, { active: !student.active });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <Users className="w-6 h-6" />
                        </div>
                        Base de Datos de Alumnos
                    </h2>
                    <p className="text-slate-400 mt-2 ml-1">Gestiona el listado completo de tus estudiantes</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg ${isAdding
                        ? 'bg-slate-800 text-slate-300 border border-white/10'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                        }`}
                >
                    {isAdding ? <><XCircle className="w-5 h-5" /> Cancelar</> : <><Plus className="w-5 h-5" /> Nuevo Alumno</>}
                </button>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
                <AnimatePresence>
                    {isAdding && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleAdd}
                            className="p-6 md:p-8 bg-slate-950/40 border-b border-white/5 grid grid-cols-1 md:grid-cols-12 gap-6"
                        >
                            <div className="md:col-span-5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre del Alumno</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Mensual</label>
                                <div className="relative">
                                    <DollarSign className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                                    <input
                                        type="number"
                                        placeholder="35000"
                                        className="pl-11 px-4 py-3 w-full rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono font-bold"
                                        value={newStudent.defaultRate}
                                        onChange={e => setNewStudent({ ...newStudent, defaultRate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duración</label>
                                <div className="relative">
                                    <Clock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                                    <select
                                        className="pl-11 px-4 py-3 w-full rounded-xl border border-slate-700 bg-slate-950/50 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                                        value={newStudent.duration}
                                        onChange={e => setNewStudent({ ...newStudent, duration: e.target.value })}
                                    >
                                        <option value="20 min">20 min</option>
                                        <option value="30 min">30 min</option>
                                        <option value="45 min">45 min</option>
                                        <option value="1 hora">1 hora</option>
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-white/5 mt-2">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Agrupación Familiar (Opcional)</label>
                                    <div className="relative">
                                        <Home className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/30 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="Ej: Familia González"
                                            value={newStudent.family}
                                            onChange={e => setNewStudent({ ...newStudent, family: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SII Fields */}
                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-white/5 mt-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Nombre Completo (SII)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/30 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="Nombre para boleta"
                                        value={newStudent.fullName}
                                        onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Dirección</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/30 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="Dirección SII"
                                        value={newStudent.address}
                                        onChange={e => setNewStudent({ ...newStudent, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">RUT</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/30 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono"
                                        placeholder="12.345.678-K"
                                        value={newStudent.rut}
                                        onChange={e => setNewStudent({ ...newStudent, rut: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">E-mail</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950/30 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="ejemplo@correo.com"
                                        value={newStudent.email}
                                        onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3 flex items-end">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
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
                                <th className="px-4 py-5 text-center w-16">#</th>
                                <th className="px-8 py-5">Nombre</th>
                                <th className="px-6 py-5">SII / Contacto</th>
                                <th className="px-6 py-5">Duración</th>
                                <th className="px-6 py-5">Tarifa Base</th>
                                <th className="px-6 py-5">Estado</th>
                                <th className="px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 border border-white/5">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-400 font-medium text-lg">No hay alumnos registrados</p>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto">Agrega alumnos a tu base de datos para importarlos fácilmente en cada mes.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {/* Render Families */}
                                    {Object.entries(groupedStudents.groups).map(([familyName, familyMembers]) => (
                                        <React.Fragment key={familyName}>
                                            <tr className="bg-slate-900/80 border-b border-white/5">
                                                <td colSpan="7" className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm uppercase tracking-wider pl-2">
                                                        <Home className="w-4 h-4" />
                                                        {familyName}
                                                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full normal-case tracking-normal">
                                                            {familyMembers.length} alumnos
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {familyMembers.map((student, index) => (
                                                <StudentRow
                                                    key={student.id}
                                                    index={index + 1} // Index within family? Or global? Let's use simple counter if needed, or just keep it simple.
                                                    // Warning: Index might look weird if reset per family. Let's just pass a unique key or handle index globally if strictly needed.
                                                    // For now, let's just pass something unique or simple.
                                                    student={student}
                                                    onToggle={() => toggleActive(student)}
                                                    onDelete={() => deleteStudentInDb(student.id)}
                                                    onUpdate={(updates) => updateStudentInDb(student.id, updates)}
                                                />
                                            ))}
                                        </React.Fragment>
                                    ))}

                                    {/* Render Individual Students (No Family) */}
                                    {groupedStudents.noFamily.length > 0 && (
                                        <>
                                            {Object.keys(groupedStudents.groups).length > 0 && (
                                                <tr className="bg-slate-900/80 border-b border-white/5">
                                                    <td colSpan="7" className="px-4 py-3">
                                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider pl-2">
                                                            <User className="w-4 h-4" />
                                                            Individuales
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {groupedStudents.noFamily.map((student, index) => (
                                                <StudentRow
                                                    key={student.id}
                                                    index={index + 1}
                                                    student={student}
                                                    onToggle={() => toggleActive(student)}
                                                    onDelete={() => deleteStudentInDb(student.id)}
                                                    onUpdate={(updates) => updateStudentInDb(student.id, updates)}
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
        </div>
    );
};

const StudentRow = ({ student, index, onToggle, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: student.name,
        fullName: student.fullName || '',
        address: student.address || '',
        rut: student.rut || '',
        email: student.email || '',
        defaultRate: student.defaultRate,
        duration: student.duration || '1 hora',
        family: student.family || ''
    });

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <tr className="bg-indigo-500/5">
                <td className="px-4 py-4 text-center text-slate-500 font-mono text-xs max-w-[50px]">
                    {index}
                </td>
                <td className="px-8 py-4">
                    <div className="space-y-2">
                        <input
                            className="w-full px-3 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white focus:ring-2 focus:ring-indigo-500/50 font-bold outline-none transition-all"
                            value={editData.name}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                            placeholder="Nombre corto"
                        />
                        <div className="flex gap-2">
                            <input
                                className="w-1/2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/50 text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                value={editData.fullName}
                                onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                                placeholder="Nombre Completo"
                            />
                            <div className="relative w-1/2">
                                <Home className="w-3 h-3 absolute left-2 top-2.5 text-slate-500" />
                                <input
                                    className="w-full pl-6 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/50 text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    value={editData.family}
                                    onChange={e => setEditData({ ...editData, family: e.target.value })}
                                    placeholder="Familia (Opcional)"
                                />
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="space-y-1.5">
                        <input
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/50 text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            value={editData.address}
                            onChange={e => setEditData({ ...editData, address: e.target.value })}
                            placeholder="Dirección"
                        />
                        <div className="flex gap-2">
                            <input
                                className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/50 text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                value={editData.rut}
                                onChange={e => setEditData({ ...editData, rut: e.target.value })}
                                placeholder="RUT"
                            />
                            <input
                                className="w-1/2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/50 text-white text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                value={editData.email}
                                onChange={e => setEditData({ ...editData, email: e.target.value })}
                                placeholder="Email"
                            />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="relative">
                        <Clock className="w-4 h-4 absolute left-2 top-3 text-slate-500" />
                        <select
                            className="w-32 pl-7 px-3 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none text-xs"
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
                    <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-2 top-3 text-slate-500" />
                        <input
                            type="number"
                            className="w-32 pl-7 px-3 py-2 rounded-lg border border-indigo-500/30 bg-slate-950 text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500/50"
                            value={editData.defaultRate}
                            onChange={e => setEditData({ ...editData, defaultRate: e.target.value })}
                        />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2 py-1 rounded-full text-center block">Editando</span>
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
            <td className="px-4 py-5 text-center text-slate-500 font-mono text-xs">
                {index}
            </td>
            <td className="px-8 py-5">
                <p className="font-bold text-white text-base tracking-tight">{student.name}</p>
                {student.fullName && <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{student.fullName}</p>}
            </td>
            <td className="px-6 py-5">
                <div className="space-y-1">
                    {student.address && <p className="text-xs text-slate-400 flex items-center gap-1.5"><span className="text-[10px] text-slate-600 font-bold w-3">D:</span> {student.address}</p>}
                    <div className="flex gap-3">
                        {student.rut && <p className="text-[11px] text-slate-500 font-mono tracking-tighter flex items-center gap-1.5"><span className="text-[10px] text-slate-600 font-bold w-3">R:</span> {student.rut}</p>}
                        {student.email && <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate max-w-[150px]"><span className="text-[10px] text-slate-600 font-bold w-3">M:</span> {student.email}</p>}
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {student.duration || '1 hora'}
                </div>
            </td>
            <td className="px-6 py-5">
                <span className="font-mono text-slate-400 font-bold bg-slate-800/50 border border-white/5 px-2.5 py-1 rounded-lg text-sm">
                    ${Number(student.defaultRate).toLocaleString('es-CL')}
                </span>
            </td>
            <td className="px-6 py-5">
                <button
                    onClick={onToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-lg active:scale-95 tracking-widest ${student.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/50 text-slate-500 border border-white/5'
                        }`}
                >
                    {student.active ? (
                        <>
                            <CheckCircle className="w-3.5 h-3.5" /> ACTIVO
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5" /> INACTIVO
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
                        <User className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

export default StudentDatabase;
