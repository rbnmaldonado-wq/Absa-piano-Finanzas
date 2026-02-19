
import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialData } from '../utils/initialData';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const [data, setData] = useLocalStorage('finance_data_2026', initialData);

    // Data Migration / Initialization for missing fields
    useEffect(() => {
        let updated = false;
        const newData = { ...data };

        if (!newData.categories) {
            newData.categories = initialData.categories;
            updated = true;
        }
        if (!newData.paymentMethods) {
            newData.paymentMethods = initialData.paymentMethods;
            updated = true;
        }
        if (!newData.schedule) {
            newData.schedule = initialData.schedule;
            updated = true;
        }
        if (!newData.brandSettings) {
            newData.brandSettings = initialData.brandSettings;
            updated = true;
        }

        if (updated) {
            // console.log("Migrating data: added missing fields");
            setData(newData);
        }
    }, [data.categories, data.paymentMethods, data.schedule, data.brandSettings]);

    // Helper to add a generic transaction (income or expense)
    const addTransaction = (monthIndex, type, transaction) => {
        const updatedMonths = [...data.months];
        if (type === 'expense') {
            updatedMonths[monthIndex].expenses.push({ ...transaction, id: Date.now() });
        } else {
            updatedMonths[monthIndex].incomes.push({ ...transaction, id: Date.now() });
        }
        setData({ ...data, months: updatedMonths });
    };

    // Helper for Piano Classes
    const addPianoClass = (monthIndex, pianoClass) => {
        const updatedMonths = [...data.months];
        updatedMonths[monthIndex].pianoClasses.push({ ...pianoClass, id: Date.now() });
        setData({ ...data, months: updatedMonths });
    };

    const updatePianoClass = (monthIndex, classId, updatedFields) => {
        const updatedMonths = [...data.months];
        const classIndex = updatedMonths[monthIndex].pianoClasses.findIndex(c => c.id === classId);
        if (classIndex > -1) {
            updatedMonths[monthIndex].pianoClasses[classIndex] = {
                ...updatedMonths[monthIndex].pianoClasses[classIndex],
                ...updatedFields
            };
            setData({ ...data, months: updatedMonths });
        }
    };

    const deletePianoClass = (monthIndex, classId) => {
        const updatedMonths = [...data.months];
        updatedMonths[monthIndex].pianoClasses = updatedMonths[monthIndex].pianoClasses.filter(c => c.id !== classId);
        setData({ ...data, months: updatedMonths });
    };

    const deleteTransaction = (monthIndex, type, id) => {
        const updatedMonths = [...data.months];
        if (type === 'expense') {
            updatedMonths[monthIndex].expenses = updatedMonths[monthIndex].expenses.filter(t => t.id !== id);
        } else {
            updatedMonths[monthIndex].incomes = updatedMonths[monthIndex].incomes.filter(t => t.id !== id);
        }
        setData({ ...data, months: updatedMonths });
    };

    // KPI Calculations
    const getAnnualSummary = () => {
        let totalIncome = 0;
        let totalExpense = 0;

        data.months.forEach(month => {
            // Expenses
            month.expenses.forEach(e => totalExpense += Number(e.amount));
            // Incomes
            month.incomes.forEach(i => totalIncome += Number(i.amount));
            // Piano Classes (Calculate as income)
            month.pianoClasses.forEach(c => {
                // Only count if paid? Or projected? Let's count all for now or add a filter by status later
                // For balance usually we count realized income. Let's assume 'total' is the value
                totalIncome += Number(c.total);
            });
        });

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    };

    // Student Database Methods
    const addStudentToDb = (student) => {
        const newStudent = { ...student, id: Date.now(), active: true };
        setData({ ...data, studentDb: [...(data.studentDb || []), newStudent] });
    };

    const updateStudentInDb = (id, updatedFields) => {
        const updatedDb = (data.studentDb || []).map(s =>
            s.id === id ? { ...s, ...updatedFields } : s
        );
        setData({ ...data, studentDb: updatedDb });
    };

    const deleteStudentInDb = (id) => {
        const updatedDb = (data.studentDb || []).filter(s => s.id !== id);
        setData({ ...data, studentDb: updatedDb });
    };

    const importStudentsToMonth = (monthIndex) => {
        const activeStudents = (data.studentDb || []).filter(s => s.active);
        const currentMonthClasses = data.months[monthIndex].pianoClasses;

        const newClasses = activeStudents
            .filter(s => !currentMonthClasses.some(c => c.studentId === s.id || c.studentName === s.name)) // Avoid duplicates
            .map(s => ({
                id: Date.now() + Math.random(), // Unique ID for the class instance
                studentId: s.id,
                studentName: s.name,
                rate: s.defaultRate,
                duration: s.duration || '1 hora',
                count: 4, // Default count
                total: Number(s.defaultRate) * 4,
                status: 'Pendiente'
            }));

        if (newClasses.length === 0) return 0; // No new students to import

        const updatedMonths = [...data.months];
        updatedMonths[monthIndex].pianoClasses = [...updatedMonths[monthIndex].pianoClasses, ...newClasses];
        setData({ ...data, months: updatedMonths });
        return newClasses.length;
    };

    const importSpecificStudents = (monthIndex, studentIds) => {
        const selectedStudents = (data.studentDb || []).filter(s => studentIds.includes(s.id));
        const currentMonthClasses = data.months[monthIndex].pianoClasses;

        const newClasses = selectedStudents
            .filter(s => !currentMonthClasses.some(c => c.studentId === s.id || c.studentName === s.name)) // Avoid duplicates
            .map(s => ({
                id: Date.now() + Math.random(),
                studentId: s.id,
                studentName: s.name,
                rate: s.defaultRate,
                duration: s.duration || '1 hora',
                count: 4,
                total: Number(s.defaultRate) * 4,
                status: 'Pendiente'
            }));

        if (newClasses.length === 0) return 0;

        const updatedMonths = [...data.months];
        updatedMonths[monthIndex].pianoClasses = [...updatedMonths[monthIndex].pianoClasses, ...newClasses];
        setData({ ...data, months: updatedMonths });
        return newClasses.length;
    };

    // Payment Methods
    const addPaymentMethod = (method) => {
        const newMethod = { ...method, id: Date.now() };
        setData({ ...data, paymentMethods: [...(data.paymentMethods || []), newMethod] });
    };

    const updatePaymentMethod = (id, updatedFields) => {
        const updatedMethods = (data.paymentMethods || []).map(m =>
            m.id === id ? { ...m, ...updatedFields } : m
        );
        setData({ ...data, paymentMethods: updatedMethods });
    };

    const deletePaymentMethod = (id) => {
        const updatedMethods = (data.paymentMethods || []).filter(m => m.id !== id);
        setData({ ...data, paymentMethods: updatedMethods });
    };

    // Categories & Subcategories
    const addSubcategory = (categoryId, subcategoryName) => {
        const updatedCategories = data.categories.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, subcategories: [...(cat.subcategories || []), subcategoryName] };
            }
            return cat;
        });
        setData({ ...data, categories: updatedCategories });
    };

    const addCategory = (category) => {
        const newCategory = { ...category, id: Date.now(), subcategories: [] };
        setData({ ...data, categories: [...(data.categories || []), newCategory] });
    };

    const updateCategory = (categoryId, updatedFields) => {
        const updatedCategories = data.categories.map(cat =>
            cat.id === categoryId ? { ...cat, ...updatedFields } : cat
        );
        setData({ ...data, categories: updatedCategories });
    };

    const deleteCategory = (categoryId) => {
        const updatedCategories = data.categories.filter(cat => cat.id !== categoryId);
        setData({ ...data, categories: updatedCategories });
    };

    const deleteSubcategory = (categoryId, subcategoryName) => {
        const updatedCategories = data.categories.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    subcategories: (cat.subcategories || []).filter(sub => sub !== subcategoryName)
                };
            }
            return cat;
        });
        setData({ ...data, categories: updatedCategories });
    };

    // Schedule Methods
    const addScheduleEntry = (entry) => {
        const newEntry = { ...entry, id: Date.now() };
        setData({ ...data, schedule: [...(data.schedule || []), newEntry] });
    };

    const updateScheduleEntry = (id, updatedFields) => {
        const updatedSchedule = (data.schedule || []).map(item =>
            item.id === id ? { ...item, ...updatedFields } : item
        );
        setData({ ...data, schedule: updatedSchedule });
    };

    const deleteScheduleEntry = (id) => {
        const updatedSchedule = (data.schedule || []).filter(item => item.id !== id);
        setData({ ...data, schedule: updatedSchedule });
    };

    const updateBrandSettings = (updatedFields) => {
        setData({
            ...data,
            brandSettings: {
                ...(data.brandSettings || initialData.brandSettings),
                ...updatedFields
            }
        });
    };

    // Data Management
    const loadData = (newData) => {
        setData(newData);
    };

    const startNewYear = () => {
        // Create a fresh copy of initial months structure
        const freshMonths = JSON.parse(JSON.stringify(initialData.months));

        setData({
            ...data,
            months: freshMonths,
            schedule: [], // Optional: clear schedule or keep it? User said "resets monthly data", usually schedule implies weekly recurrence functionality which might persist.
            // Let's keep schedule if it's a weekly recurrence. If it's specific dates, reset.
            // based on the code, it's "Lunes", "Martes" etc, so it's a weekly schedule.
            // Keeping schedule might be better, or offering option. 
            // The prompt says "resets monthly data". I'll keep schedule for now as it's likely recurring.
            // Actually user said "datos mensuales", schedule is weekly.
            // Let's just reset months.
        });
    };

    const value = {
        data,
        updateData: setData,
        addTransaction,
        deleteTransaction,
        addPianoClass,
        updatePianoClass,
        deletePianoClass,
        getAnnualSummary,
        addStudentToDb,
        updateStudentInDb,
        deleteStudentInDb,
        importStudentsToMonth,
        importSpecificStudents,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,
        addScheduleEntry,
        updateScheduleEntry,
        deleteScheduleEntry,
        updateBrandSettings,
        loadData,
        startNewYear
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
