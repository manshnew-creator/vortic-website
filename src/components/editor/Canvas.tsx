import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BlockRenderer } from '../renderer/BlockRenderer';

export const Canvas: React.FC = () => {
  const { schema, viewportMode, setViewportMode, selectedBlockId, setSelectedBlockId } = useEditorStore();

  if (!schema) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-gray-500">Loading editor canvas schema...</p>
        </div>
      </div>
    );
  }

  // Get current width size depending on viewport state
  const getCanvasWidthClass = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'w-[375px] min-h-[667px] shadow-2xl border border-gray-200';
      case 'tablet':
        return 'w-[768px] min-h-[1024px] shadow-2xl border border-gray-200';
      case 'desktop':
      default:
        return 'w-full min-h-full';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f3f4f6] overflow-hidden select-none">
      {/* Viewport Control Bar */}
      <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded text-xs font-medium flex items-center ${
              viewportMode === 'desktop'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Desktop Mode (100%)"
          >
            <span className="mr-1">💻</span> Desktop
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded text-xs font-medium flex items-center ${
              viewportMode === 'tablet'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Tablet Mode (768px)"
          >
            <span className="mr-1">📱</span> Tablet
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded text-xs font-medium flex items-center ${
              viewportMode === 'mobile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Mobile Mode (375px)"
          >
            <span className="mr-1">📞</span> Mobile
          </button>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          {viewportMode === 'desktop' && '100% Width'}
          {viewportMode === 'tablet' && '768px (Tablet)'}
          {viewportMode === 'mobile' && '375px (Mobile)'}
        </div>

        <div className="w-24"></div> {/* Balance spacer */}
      </div>

      {/* Editor Inner Work Area */}
      <div
        className="flex-1 overflow-auto p-8 flex justify-center items-start"
        onClick={() => setSelectedBlockId(null)} // Deselect on clicking empty grey space
      >
        <div
          className={`bg-white transition-all duration-300 origin-top rounded-md ${getCanvasWidthClass()}`}
          onClick={(e) => e.stopPropagation()} // Stop propagation from triggering deselect
        >
          {/* Main Renderer Core */}
          <div className="w-full min-h-[500px] h-full relative">
            <BlockRenderer
              blockId={schema.rootBlockId}
              schema={schema}
              viewport={viewportMode}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              isEditorMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
