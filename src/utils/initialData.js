
export const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const initialCategories = [
    { id: 1, name: "Hogar", color: "bg-blue-500", type: "expense", budgetBand: "basicos", subcategories: ["Alquiler", "Gastos Comunes", "Mantenimiento"] },
    { id: 2, name: "Transporte", color: "bg-green-500", type: "expense", budgetBand: "basicos", subcategories: ["Bencina", "Uber/Taxi", "Transporte Público"] },
    { id: 3, name: "Familia", color: "bg-yellow-500", type: "expense", budgetBand: "basicos", subcategories: ["Supermercado", "Restaurante", "Delivery"] },
    { id: 4, name: "Salud", color: "bg-red-500", type: "expense", budgetBand: "basicos", subcategories: ["Medicamentos", "Consultas", "Exámenes"] },
    { id: 5, name: "Educación", color: "bg-purple-500", type: "expense", budgetBand: "estiloVida", subcategories: ["Cursos", "Materiales"] },
    { id: 6, name: "Ocio", color: "bg-pink-500", type: "expense", budgetBand: "estiloVida", subcategories: ["Cine", "Salidas", "Streaming"] },
    { id: 7, name: "Clases de Piano", color: "bg-indigo-500", type: "income", subcategories: [] },
    { id: 8, name: "Otros Ingresos", color: "bg-teal-500", type: "income", subcategories: [] },
];

export const initialPaymentMethods = [
    { id: 1, name: "Efectivo", type: "cash", color: "bg-emerald-500" },
    { id: 2, name: "Débito", type: "debit", color: "bg-blue-500" },
    { id: 3, name: "Crédito Visa", type: "credit", color: "bg-purple-500" },
];

export const initialData = {
    year: 2026,
    categories: initialCategories,
    paymentMethods: initialPaymentMethods,
    studentDb: [], // { id, name, defaultRate, active: true/false }
    months: months.map(m => ({
        name: m,
        pianoClasses: [], // { id, studentName, rate, count, total, paymentDate, status: 'Pendiente' | 'Al día' }
        expenses: [],     // { id, categoryId, amount, description, date, subcategory, paymentMethodId }
        incomes: [],      // { id, categoryId, amount, description, date }
        savings: []       // { id, description, amount, date, type: 'ahorro'|'deuda'|'inversion' }
    })),
    schedule: [], // { id, day, time, studentId, studentName }
    brandSettings: {
        name: 'AbsaPiano',
        icon: 'Music'
    }
};
