import React, { useTransition } from 'react';
import { BaseBlock, PageBuilderSchema } from '../../types/builder';
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
  resolveResponsiveValue,
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

    return (
      <div
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
        {renderedElement}
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
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <BlockRenderer
        blockId={schema.rootBlockId}
        schema={schema}
        viewport="desktop"
        isEditorMode={false}
      />
    </div>
  );
};
