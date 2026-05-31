'use client';

import React, { useMemo, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

const canContainChildren = new Set(['section', 'container', 'grid', 'form']);

export function LayersPanel() {
  const { schema, selectedBlockId, setSelectedBlockId, moveBlock, duplicateBlock, deleteBlock } = useEditorStore();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const root = schema?.rootBlockId;
  const totalBlocks = useMemo(() => schema ? Object.keys(schema.blocks).length : 0, [schema]);

  if (!schema || !root) return null;

  const toggleCollapse = (blockId: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  };

  const moveWithinParent = (blockId: string, direction: -1 | 1) => {
    const block = schema.blocks[blockId];
    if (!block?.parentId) return;
    const parent = schema.blocks[block.parentId];
    const index = parent.children.indexOf(blockId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= parent.children.length) return;
    moveBlock(blockId, parent.id, direction > 0 ? nextIndex + 1 : nextIndex);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const target = schema.blocks[targetId];
    if (!target) return;

    if (canContainChildren.has(target.type)) {
      moveBlock(draggedId, target.id, target.children.length);
    } else if (target.parentId) {
      const parent = schema.blocks[target.parentId];
      const targetIndex = parent.children.indexOf(targetId);
      moveBlock(draggedId, parent.id, Math.max(0, targetIndex));
    }

    setDraggedId(null);
  };

  const renderNode = (blockId: string, depth = 0): React.ReactNode => {
    const block = schema.blocks[blockId];
    if (!block) return null;
    const isSelected = selectedBlockId === blockId;
    const hasChildren = block.children.length > 0;
    const isCollapsed = collapsed.has(blockId);

    return (
      <div key={blockId}>
        <div
          draggable={blockId !== root}
          onDragStart={() => setDraggedId(blockId)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(blockId)}
          className={`group flex items-center gap-1 rounded-xl border px-2 py-1.5 text-left transition ${
            isSelected
              ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
              : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/80 hover:text-white'
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggleCollapse(blockId)}
            className="h-5 w-5 rounded text-[10px] text-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label={isCollapsed ? 'Expand layer' : 'Collapse layer'}
          >
            {hasChildren ? (isCollapsed ? '▸' : '▾') : '•'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedBlockId(blockId)}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block truncate text-[11px] font-black">{block.name || block.type}</span>
            <span className="block truncate text-[9px] font-mono uppercase text-slate-500">{block.type}</span>
          </button>
          {blockId !== root && (
            <div className="hidden items-center gap-0.5 group-hover:flex">
              <button type="button" onClick={() => moveWithinParent(blockId, -1)} className="rounded bg-slate-800 px-1.5 py-1 text-[9px] text-slate-300 hover:text-white">↑</button>
              <button type="button" onClick={() => moveWithinParent(blockId, 1)} className="rounded bg-slate-800 px-1.5 py-1 text-[9px] text-slate-300 hover:text-white">↓</button>
            </div>
          )}
        </div>
        {!isCollapsed && hasChildren && (
          <div className="mt-1 space-y-1">
            {block.children.map((childId) => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="hidden xl:flex w-64 shrink-0 flex-col border-r border-slate-900 bg-slate-950 text-slate-200">
      <div className="border-b border-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Layers</h2>
          <span className="rounded-full bg-slate-900 px-2 py-1 text-[9px] font-black text-slate-500">{totalBlocks}</span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Drag layers to containers or use arrows to reorder siblings.</p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {renderNode(root)}
      </div>
      {selectedBlockId && selectedBlockId !== root && (
        <div className="grid grid-cols-2 gap-2 border-t border-slate-900 p-3">
          <button type="button" onClick={() => duplicateBlock(selectedBlockId)} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-slate-300 hover:text-white">Duplicate</button>
          <button type="button" onClick={() => deleteBlock(selectedBlockId)} className="rounded-xl bg-rose-500/10 px-3 py-2 text-[10px] font-black text-rose-300 hover:bg-rose-500/20">Delete</button>
        </div>
      )}
    </aside>
  );
}
