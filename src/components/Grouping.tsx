import { useState } from 'react';
import { motion } from 'motion/react';
import Papa from 'papaparse';
import { Users, LayoutGrid, Shuffle, Download } from 'lucide-react';
import { Person, Group } from '../types';

interface GroupingProps {
  people: Person[];
}

export default function Grouping({ people }: GroupingProps) {
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<Group[]>([]);

  const generateGroups = () => {
    if (people.length === 0) return;

    const shuffled = [...people].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    const numGroups = Math.ceil(shuffled.length / groupSize);

    for (let i = 0; i < numGroups; i++) {
      newGroups.push({
        id: `group-${i}`,
        name: `第 ${i + 1} 組`,
        members: shuffled.slice(i * groupSize, (i + 1) * groupSize)
      });
    }

    setGroups(newGroups);
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;

    const data = groups.flatMap(group => 
      group.members.map(member => ({
        '組別': group.name,
        '姓名': member.name
      }))
    );

    const csv = Papa.unparse(data);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `分組結果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
        <Users size={48} strokeWidth={1} />
        <p>請先在「名單管理」中加入成員</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">每組人數</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2"
                max={Math.max(2, people.length)}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="w-32 md:w-48 accent-zinc-900"
              />
              <span className="text-lg font-bold text-zinc-900 w-8">{groupSize}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-100 hidden md:block" />
          <div className="text-sm text-zinc-500">
            預計分為 <span className="font-bold text-zinc-900">{Math.ceil(people.length / groupSize)}</span> 組
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={generateGroups}
            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 px-8"
          >
            <Shuffle size={18} />
            開始分組
          </button>
          {groups.length > 0 && (
            <button
              onClick={downloadCSV}
              className="btn-secondary flex items-center justify-center gap-2 px-4"
              title="下載 CSV"
            >
              <Download size={18} />
              下載結果
            </button>
          )}
        </div>
      </div>

      {/* Visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <h4 className="font-bold text-zinc-900">{group.name}</h4>
              <span className="text-xs font-medium text-zinc-400 bg-white px-2 py-1 rounded-md border border-zinc-100">
                {group.members.length} 人
              </span>
            </div>
            <div className="p-4 space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50/50 text-sm font-medium text-zinc-700"
                >
                  <div className="w-2 h-2 rounded-full bg-zinc-300" />
                  {member.name}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-zinc-400 space-y-4 border-2 border-dashed border-zinc-100 rounded-3xl">
            <LayoutGrid size={48} strokeWidth={1} />
            <p className="text-sm">設定分組人數並點擊「開始分組」</p>
          </div>
        )}
      </div>
    </div>
  );
}
