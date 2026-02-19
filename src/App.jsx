import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import MonthView from './components/MonthView';
import {
  LayoutDashboard, Settings as SettingsIcon, Calendar, Menu, X, User,
  ChevronDown, ChevronRight, FileText, Music, AudioLines, Mic2, Disc,
  Music2, Languages, Piano, Undo, Redo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import StudentDatabase from './components/StudentDatabase';
import Settings from './components/Settings';
import Schedule from './components/Schedule';
import SIIData from './components/SIIData';

function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

function AppContent() {
  const { data, updateBrandSettings, undo, redo, canUndo, canRedo } = useFinance();
  const brand = data.brandSettings || { name: 'AbsaPiano', icon: 'Music' };

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [monthsExpanded, setMonthsExpanded] = useState(false);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [tempBrandName, setTempBrandName] = useState(brand.name);

  const brandIcons = {
    Music: Music,
    AudioLines: AudioLines,
    Mic2: Mic2,
    Disc: Disc,
    Music2: Music2,
    Languages: Languages,
    Piano: Piano
  };

  const cycleIcon = () => {
    const iconKeys = Object.keys(brandIcons);
    const currentIndex = iconKeys.indexOf(brand.icon);
    const nextIndex = (currentIndex + 1) % iconKeys.length;
    updateBrandSettings({ icon: iconKeys[nextIndex] });
  };

  const BrandIcon = brandIcons[brand.icon] || Music;

  const handleBrandNameSave = () => {
    updateBrandSettings({ name: tempBrandName });
    setIsEditingBrand(false);
  };

  const handleMonthSelect = (index) => {
    setSelectedMonth(index);
    setCurrentView('month');
    // On mobile, close sidebar
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans relative overflow-hidden">
      {/* Global Ambient Background Lights */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none z-0"></div>

      {/* Undo/Redo Floating Buttons */}
      {/* Undo/Redo Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex gap-3">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`flex items-center gap-2 px-4 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white rounded-full shadow-2xl transition-all font-bold group ${canUndo ? 'hover:bg-slate-800 active:scale-95' : 'opacity-40 cursor-not-allowed grayscale'}`}
        >
          <Undo className={`w-5 h-5 transition-colors ${canUndo ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-slate-500'}`} />
          <span className="hidden md:inline">Deshacer</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`flex items-center gap-2 px-4 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white rounded-full shadow-2xl transition-all font-bold group ${canRedo ? 'hover:bg-slate-800 active:scale-95' : 'opacity-40 cursor-not-allowed grayscale'}`}
        >
          <Redo className={`w-5 h-5 transition-colors ${canRedo ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-slate-500'}`} />
          <span className="hidden md:inline">Rehacer</span>
        </button>
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-5 right-5 z-50 p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white active:scale-95 transition-all"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed md:sticky top-0 h-screen w-72 bg-slate-950/40 backdrop-blur-2xl border-r border-white/5 p-6 z-40 shadow-2xl md:shadow-none font-sans"
          >
            <div className="flex items-center gap-3 mb-10 px-1 mt-2 group/brand">
              <button
                onClick={cycleIcon}
                className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 group-hover/brand:rotate-12"
                title="Cambiar icono"
              >
                <BrandIcon className="w-5 h-5 text-white" />
              </button>

              <div className="flex-1 min-w-0">
                {isEditingBrand ? (
                  <input
                    autoFocus
                    className="bg-slate-900/60 border border-indigo-500/50 rounded-lg px-2 py-1 text-base font-bold text-white w-full outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={tempBrandName}
                    onChange={(e) => setTempBrandName(e.target.value)}
                    onBlur={handleBrandNameSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleBrandNameSave()}
                  />
                ) : (
                  <h1
                    onClick={() => {
                      setTempBrandName(brand.name);
                      setIsEditingBrand(true);
                    }}
                    className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 cursor-pointer hover:from-white hover:to-white transition-all truncate"
                  >
                    {brand.name}
                  </h1>
                )}
              </div>
            </div>

            <nav className="space-y-1 overflow-y-auto h-[calc(100vh-140px)] pr-2 custom-scrollbar">
              <NavItem
                icon={LayoutDashboard}
                label="Dashboard"
                isActive={currentView === 'dashboard'}
                onClick={() => setCurrentView('dashboard')}
              />

              <div className="space-y-4">
                {/* Monthly Management Dropdown */}
                <div>
                  <button
                    onClick={() => setMonthsExpanded(!monthsExpanded)}
                    className="w-full flex items-center justify-between px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
                  >
                    Gestión Mensual
                    {monthsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {monthsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {months.map((month, index) => (
                          <button
                            key={month}
                            onClick={() => {
                              setSelectedMonth(index);
                              setCurrentView('month');
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentView === 'month' && selectedMonth === index
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${currentView === 'month' && selectedMonth === index ? 'bg-white' : 'bg-slate-600'}`}></div>
                            {month}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 mt-8">
                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Administración</p>
                <div className="space-y-1">
                  <NavItem
                    icon={User}
                    label="Mis Alumnos"
                    isActive={currentView === 'students'}
                    onClick={() => setCurrentView('students')}
                  />
                  <NavItem
                    icon={Calendar}
                    label="Horario"
                    isActive={currentView === 'schedule'}
                    onClick={() => setCurrentView('schedule')}
                  />
                  <NavItem
                    icon={FileText}
                    label="Datos SII"
                    isActive={currentView === 'sii'}
                    onClick={() => setCurrentView('sii')}
                  />
                  <NavItem
                    icon={SettingsIcon}
                    label="Configuración"
                    isActive={currentView === 'settings'}
                    onClick={() => setCurrentView('settings')}
                  />
                </div>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        <div className="mx-auto pt-16 md:pt-0 max-w-6xl"> {/* Increased max-width for better spacing */}
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'month' && selectedMonth !== null && (
              <MonthView
                monthIndex={selectedMonth}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'students' && <StudentDatabase />}
            {currentView === 'schedule' && <Schedule />}
            {currentView === 'sii' && <SIIData />}
            {currentView === 'settings' && <Settings />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
      ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-indigo-500/30'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
    {label}
  </button>
);

export default App;
