import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, ListChecks, Sparkles } from 'lucide-react';
import { Person, AppTab, Prize } from './types';
import ListManager from './components/ListManager';
import LuckyDraw from './components/LuckyDraw';
import Grouping from './components/Grouping';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('list');
  const [people, setPeople] = useState<Person[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '特等獎', count: 1 },
    { id: '2', name: '頭獎', count: 3 },
  ]);

  const tabs = [
    { id: 'list', label: '名單管理', icon: ListChecks },
    { id: 'draw', label: '獎品抽籤', icon: Trophy },
    { id: 'group', label: '自動分組', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-zinc-900">LuckyList</h1>
          </div>
          
          <nav className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AppTab)}
                  className={`
                    relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                    ${isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'list' && (
              <ListManager 
                people={people} 
                setPeople={setPeople} 
                prizes={prizes} 
                setPrizes={setPrizes} 
              />
            )}
            {activeTab === 'draw' && (
              <LuckyDraw people={people} prizes={prizes} />
            )}
            {activeTab === 'group' && (
              <Grouping people={people} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-zinc-200 text-center">
        <p className="text-sm text-zinc-400">
          LuckyList &copy; {new Date().getFullYear()} &middot; 您的極簡抽籤與分組助手
        </p>
      </footer>
    </div>
  );
}
