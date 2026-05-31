'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Command = {
  id: string;
  title: string;
  description: string;
  shortcut?: string;
  icon: string;
  run: () => void;
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.title} ${command.description} ${command.shortcut || ''}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filteredCommands.length - 1));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }

      if (event.key === 'Enter' && filteredCommands[activeIndex]) {
        event.preventDefault();
        filteredCommands[activeIndex].run();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filteredCommands, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-slate-950/70 px-4 pt-[12vh] backdrop-blur-xl" onMouseDown={onClose}>
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/60 ring-1 ring-indigo-500/10"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
            <span className="text-lg">⌘</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search commands, templates, publishing, import/export..."
              className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
            />
            <kbd className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-black text-slate-400">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filteredCommands.map((command, index) => (
            <button
              key={command.id}
              type="button"
              onClick={() => {
                command.run();
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                activeIndex === index ? 'bg-indigo-500/15 text-white' : 'text-slate-300 hover:bg-white/[0.045] hover:text-white'
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">{command.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">{command.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{command.description}</span>
              </span>
              {command.shortcut && <kbd className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-500">{command.shortcut}</kbd>}
            </button>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-6 py-14 text-center text-sm text-slate-500">No matching command found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
