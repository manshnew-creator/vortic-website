'use client';

import React, { useEffect, useState } from 'react';
import { PageBuilderSchema } from '../../types/builder';
import { useEditorStore } from '../../store/editorStore';
import {
  SectionBlock,
  ContainerBlock,
  GridBlock,
  HeadingBlock,
  TextBlock,
  ButtonBlock,
  ImageBlock,
  VideoBlock,
  FormBlock,
  InputBlock,
  TextAreaBlock,
  SubmitButtonBlock,
} from './Registry';

interface BlockRendererProps {
  blockId: string;
  schema: PageBuilderSchema;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onSelectBlock?: (id: string) => void;
  selectedBlockId?: string | null;
  isEditorMode?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blockId,
  schema,
  viewport,
  onSelectBlock,
  selectedBlockId,
  isEditorMode = false,
}) => {
  const block = schema.blocks[blockId];
  const { viewportMode, updateBlockLayout, moveBlock, duplicateBlock, deleteBlock } = useEditorStore();
  if (!block) return null;

  // Enforce visibility rules inside preview/published sites
  if (!isEditorMode) {
    const { visibility } = block;
    if (visibility) {
      if (viewport === 'desktop' && !visibility.showOnDesktop) return null;
      if (viewport === 'tablet' && !visibility.showOnTablet) return null;
      if (viewport === 'mobile' && !visibility.showOnMobile) return null;
    }
  }

  const isSelected = selectedBlockId === blockId;

  // Render children recursively
  const renderChildren = () => {
    return block.children.map((childId) => (
      <BlockRenderer
        key={childId}
        blockId={childId}
        schema={schema}
        viewport={viewport}
        onSelectBlock={onSelectBlock}
        selectedBlockId={selectedBlockId}
        isEditorMode={isEditorMode}
      />
    ));
  };

  const wrapInEditorControls = (renderedElement: React.ReactNode) => {
    if (!isEditorMode) return renderedElement;

    const isRoot = blockId === schema.rootBlockId;

    const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startY = event.clientY;
      const wrapper = event.currentTarget.parentElement;
      const rect = wrapper?.getBoundingClientRect();
      const currentWidth = block.layout.width?.[viewportMode] || block.layout.width?.desktop || '100%';
      const currentMinHeight = block.layout.minHeight?.[viewportMode] || block.layout.minHeight?.desktop || '';
      const initialWidth = currentWidth.endsWith('px') ? parseFloat(currentWidth) : (rect?.width || 320);
      const initialHeight = currentMinHeight.endsWith('px') ? parseFloat(currentMinHeight) : (rect?.height || 120);

      const onMove = (moveEvent: PointerEvent) => {
        const nextWidth = Math.max(120, Math.round(initialWidth + moveEvent.clientX - startX));
        const nextHeight = Math.max(48, Math.round(initialHeight + moveEvent.clientY - startY));
        updateBlockLayout(blockId, {
          width: { ...(block.layout.width || { desktop: '100%' }), [viewportMode]: `${nextWidth}px` },
          minHeight: { ...(block.layout.minHeight || { desktop: '0px' }), [viewportMode]: `${nextHeight}px` },
        });
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
      if (isRoot) return;
      event.stopPropagation();
      event.dataTransfer.setData('application/x-vortic-block', blockId);
      event.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      const draggedId = event.dataTransfer.getData('application/x-vortic-block');
      if (!draggedId || draggedId === blockId) return;
      event.preventDefault();
      event.stopPropagation();

      const canContain = ['section', 'container', 'grid', 'form'].includes(block.type);
      if (canContain) {
        moveBlock(draggedId, blockId, block.children.length);
        return;
      }

      if (block.parentId && schema.blocks[block.parentId]) {
        const parent = schema.blocks[block.parentId];
        const targetIndex = parent.children.indexOf(blockId);
        moveBlock(draggedId, parent.id, Math.max(0, targetIndex));
      }
    };

    return (
      <div
        draggable={!isRoot}
        onDragStart={handleDragStart}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('application/x-vortic-block')) event.preventDefault();
        }}
        onDrop={handleDrop}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectBlock) onSelectBlock(blockId);
        }}
        className={`relative group/block transition-all ${
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-1'
            : 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
        }`}
      >
        {/* Block Badge / Controller Label */}
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-br opacity-0 group-hover/block:opacity-100 transition-opacity z-50 pointer-events-none">
          {block.name}
        </div>
        {isSelected && !isRoot && (
          <div className="absolute -top-8 right-0 z-[70] hidden items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/95 p-1 shadow-2xl group-hover/block:flex">
            <button type="button" onClick={(e) => { e.stopPropagation(); duplicateBlock(blockId); }} className="rounded-lg px-2 py-1 text-[10px] font-black text-slate-300 hover:bg-slate-800 hover:text-white">Duplicate</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); deleteBlock(blockId); }} className="rounded-lg px-2 py-1 text-[10px] font-black text-rose-300 hover:bg-rose-500/10">Delete</button>
          </div>
        )}
        {renderedElement}
        {isSelected && !isRoot && (
          <button
            type="button"
            onPointerDown={startResize}
            className="absolute -bottom-2 -right-2 z-[60] h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg cursor-nwse-resize"
            title="Drag to resize width and height"
            aria-label="Resize selected block width and height"
          />
        )}
      </div>
    );
  };

  // Resolve block element by type
  let element: React.ReactNode = null;

  switch (block.type) {
    case 'section':
      element = <SectionBlock block={block} viewport={viewport}>{renderChildren()}</SectionBlock>;
      break;
    case 'container':
      element = <ContainerBlock block={block} viewport={viewport}>{renderChildren()}</ContainerBlock>;
      break;
    case 'grid':
      element = <GridBlock block={block} viewport={viewport}>{renderChildren()}</GridBlock>;
      break;
    case 'heading':
      element = <HeadingBlock block={block} viewport={viewport} />;
      break;
    case 'text':
      element = <TextBlock block={block} viewport={viewport} />;
      break;
    case 'button':
      element = <ButtonBlock block={block} viewport={viewport} />;
      break;
    case 'image':
      element = <ImageBlock block={block} viewport={viewport} />;
      break;
    case 'video':
      element = <VideoBlock block={block} viewport={viewport} />;
      break;
    case 'form':
      element = <FormBlock block={block} viewport={viewport}>{renderChildren()}</FormBlock>;
      break;
    case 'input':
      element = <InputBlock block={block} viewport={viewport} />;
      break;
    case 'textarea':
      element = <TextAreaBlock block={block} viewport={viewport} />;
      break;
    case 'submit-button':
      element = <SubmitButtonBlock block={block} viewport={viewport} />;
      break;
    default:
      // Unknown fallback
      element = (
        <div className="p-4 border border-dashed border-gray-300 text-center text-xs text-gray-500">
          Unknown block type: {block.type}
        </div>
      );
  }

  return <>{wrapInEditorControls(element)}</>;
};

interface StaticPageRendererProps {
  schema: PageBuilderSchema;
}

export const StaticPageRenderer: React.FC<StaticPageRendererProps> = ({ schema }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const syncViewport = () => {
      const width = window.innerWidth;
      if (width < 640) setViewport('mobile');
      else if (width < 1024) setViewport('tablet');
      else setViewport('desktop');
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <BlockRenderer
        blockId={schema.rootBlockId}
        schema={schema}
        viewport={viewport}
        isEditorMode={false}
      />
    </div>
  );
};
