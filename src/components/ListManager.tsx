import React, { useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { Upload, Trash2, UserPlus, FileText, Beaker, AlertCircle, CheckCircle2, Gift, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Person, Prize } from '../types';

interface ListManagerProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
}

const MOCK_NAMES = [
  '王小明', '李小華', '張大同', '陳志豪', '林雅婷',
  '黃建宏', '吳淑芬', '劉德華', '周杰倫', '蔡英文',
  '郭台銘', '張忠謀', '林志玲', '金城武', '周潤發',
  '梁朝偉', '張曼玉', '舒淇', '彭于晏', '桂綸鎂'
];

export default function ListManager({ people, setPeople, prizes, setPrizes }: ListManagerProps) {
  const [inputText, setInputText] = useState('');
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeCount, setNewPrizeCount] = useState(1);
  const [showClearListConfirm, setShowClearListConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find duplicates
  const duplicates = useMemo(() => {
    const counts = new Map<string, number>();
    people.forEach(p => {
      counts.set(p.name, (counts.get(p.name) || 0) + 1);
    });
    return new Set(
      Array.from(counts.entries())
        .filter(([_, count]) => count > 1)
        .map(([name]) => name)
    );
  }, [people]);

  const handleAddFromText = () => {
    const names = inputText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const newPeople: Person[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));

    setPeople([...people, ...newPeople]);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const names = results.data
          .flat()
          .map(n => String(n).trim())
          .filter(n => n.length > 0);

        const newPeople: Person[] = names.map(name => ({
          id: Math.random().toString(36).substr(2, 9),
          name
        }));
        setPeople([...people, ...newPeople]);
      },
      header: false,
      skipEmptyLines: true,
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadMockData = () => {
    const newPeople: Person[] = MOCK_NAMES.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    setPeople(newPeople);
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniquePeople = people.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    setPeople(uniquePeople);
  };

  const requestClearList = () => {
    if (people.length > 0) {
      setShowClearListConfirm(true);
    }
  };

  const confirmClearList = () => {
    setPeople([]);
    setShowClearListConfirm(false);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const addPrize = () => {
    if (!newPrizeName.trim()) return;
    const newPrize: Prize = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPrizeName,
      count: newPrizeCount
    };
    setPrizes([...prizes, newPrize]);
    setNewPrizeName('');
    setNewPrizeCount(1);
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const movePrize = (index: number, direction: 'up' | 'down') => {
    const newPrizes = [...prizes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPrizes.length) return;
    [newPrizes[index], newPrizes[targetIndex]] = [newPrizes[targetIndex], newPrizes[index]];
    setPrizes(newPrizes);
  };

  const updatePrize = (id: string, field: keyof Prize, value: string | number) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="space-y-12">
      {/* People Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <UserPlus size={20} className="text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900">名單管理</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-zinc-700">
                貼上姓名 (每行一個或用逗號隔開)
              </label>
              <button
                onClick={loadMockData}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
              >
                <Beaker size={14} />
                載入模擬名單
              </button>
            </div>
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none bg-white"
              placeholder="例如：&#10;王小明&#10;李小華&#10;張大同"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleAddFromText}
              disabled={!inputText.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              加入名單
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-700">
              上傳 CSV 檔案
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
            >
              <div className="p-3 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                <Upload className="text-zinc-500" size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-900">點擊或拖曳檔案至此</p>
                <p className="text-xs text-zinc-500 mt-1">支援 .csv 格式</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestClearList}
                disabled={people.length === 0}
                className="flex-1 btn-secondary text-red-600 border-red-100 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                清空名單
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-bottom border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-zinc-500" />
              <h3 className="font-semibold text-zinc-900">目前名單 ({people.length} 人)</h3>
            </div>
            {duplicates.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  <AlertCircle size={12} />
                  發現 {duplicates.size} 個重複姓名
                </span>
                <button
                  onClick={removeDuplicates}
                  className="text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 size={12} />
                  一鍵移除重複
                </button>
              </div>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto p-4">
            {people.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <p>尚未加入任何成員</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className={`group flex items-center justify-between p-2 px-3 rounded-lg border transition-all ${duplicates.has(person.name)
                      ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
                      : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm font-medium text-zinc-700 truncate">{person.name}</span>
                      {duplicates.has(person.name) && (
                        <AlertCircle size={12} className="text-amber-500 shrink-0" />
                      )}
                    </div>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prize Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <Gift size={20} className="text-zinc-900" />
          <h2 className="text-lg font-bold text-zinc-900">獎項設定</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Plus size={18} /> 新增獎項
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">獎項名稱</label>
                  <input
                    type="text"
                    value={newPrizeName}
                    onChange={(e) => setNewPrizeName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    placeholder="例如：特等獎"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">名額</label>
                  <input
                    type="number"
                    min="1"
                    value={newPrizeCount}
                    onChange={(e) => setNewPrizeCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={addPrize}
                  disabled={!newPrizeName.trim()}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  加入獎項
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100">
                <h3 className="font-bold text-zinc-900">獎項清單與順序</h3>
                <p className="text-xs text-zinc-500 mt-1">抽獎時將依照此順序進行</p>
              </div>
              <div className="divide-y divide-zinc-100">
                {prizes.length === 0 ? (
                  <div className="p-12 text-center text-zinc-400 italic">
                    尚未設定任何獎項
                  </div>
                ) : (
                  prizes.map((prize, index) => (
                    <div key={prize.id} className="p-4 flex items-center gap-4 group hover:bg-zinc-50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => movePrize(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => movePrize(index, 'down')}
                          disabled={index === prizes.length - 1}
                          className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={prize.name}
                          onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
                          className="px-3 py-1.5 rounded border border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:bg-white bg-transparent outline-none transition-all font-medium"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={prize.count}
                            onChange={(e) => updatePrize(prize.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-3 py-1.5 rounded border border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:bg-white bg-transparent outline-none transition-all text-center"
                          />
                          <span className="text-sm text-zinc-400">名</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePrize(prize.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showClearListConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">確定清空名單？</h3>
            <p className="text-zinc-500 text-sm">這將會清除所有已加入的成員，且無法恢復。</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearListConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmClearList}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                確定清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
