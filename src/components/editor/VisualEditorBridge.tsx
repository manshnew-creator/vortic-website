'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { VisualLayoutEngine, BoundingBox, SnapGuide } from '../../lib/editor/layoutEngine';
import { AIAuthoringEngine, AuthoringSuggestion } from '../../lib/ai/authoring';
import { CollaborationPresenceEngine, ClientPresence } from '../../lib/collaboration/presence';
import { BlockRenderer } from '../renderer/BlockRenderer';
import { Sandbox } from '../renderer/Sandbox';
import { toast } from '../ui/ToastProvider';
import { LayersPanel } from './LayersPanel';

export const VisualEditorBridge: React.FC = () => {
  const { schema, viewportMode, setViewportMode, selectedBlockId, setSelectedBlockId, updateBlockProps } = useEditorStore();
  
  // Real-time Canvas States
  const [collaborators, setCollaborators] = useState<ClientPresence[]>([]);
  const [suggestions, setSuggestions] = useState<AuthoringSuggestion[]>([]);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [showShortcutsCheatSheet, setShowShortcutsCheatSheet] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const myUserId = 'user_curr_designer_1';

  // 1. Live Collaboration & Cursor Broadcasting Loop
  useEffect(() => {
    CollaborationPresenceEngine.updatePresence(myUserId, {
      userId: myUserId,
      userName: 'Principal Designer (You)',
      cursor: { x: 0, y: 0 },
      activeBlockId: selectedBlockId,
    });

    CollaborationPresenceEngine.updatePresence('user_peer_2', {
      userId: 'user_peer_2',
      userName: 'Sarah (UX Copywriter)',
      cursor: { x: 250, y: 180 },
      activeBlockId: 'hero_paragraph',
    });

    CollaborationPresenceEngine.updatePresence('user_peer_3', {
      userId: 'user_peer_3',
      userName: 'Dave (Marketing Lead)',
      cursor: { x: 420, y: 310 },
      activeBlockId: 'hero_cta_button',
    });

    const interval = setInterval(() => {
      setCollaborators(CollaborationPresenceEngine.getActiveCollaborators());
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedBlockId]);

  // 2. Real-time AI Assistant Auditing Loop
  useEffect(() => {
    if (schema) {
      const reports = AIAuthoringEngine.analyzePage(schema);
      setSuggestions(reports);
    }
  }, [schema]);

  // 3. Broadcast mouse coordinates to peers on canvas movement
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    CollaborationPresenceEngine.updatePresence(myUserId, {
      userId: myUserId,
      userName: 'Principal Designer (You)',
      cursor: { x, y },
      activeBlockId: selectedBlockId,
    });
  };

  const handleApplyAiSuggestion = (suggestion: AuthoringSuggestion) => {
    if (suggestion.blockId && suggestion.suggestedActionPatch) {
      updateBlockProps(suggestion.blockId, suggestion.suggestedActionPatch);
      toast({
        title: 'AI optimization applied',
        description: suggestion.title,
        variant: 'success',
      });
    }
  };

  if (!schema) return null;

  // Resolve responsive canvas width dynamically
  const getCanvasWidthClass = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'w-[375px] max-w-full min-h-[667px] shadow-2xl border border-slate-800 bg-[#090d16]';
      case 'tablet':
        return 'w-[768px] max-w-full min-h-[1024px] shadow-2xl border border-slate-800 bg-[#090d16]';
      case 'desktop':
      default:
        return 'w-full min-h-full bg-[#090d16]';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-gray-50 font-sans text-slate-200" onMouseMove={handleCanvasMouseMove}>
      
      {/* Viewport Control Bar */}
      <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10 text-slate-800">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded text-xs font-medium flex items-center ${
              viewportMode === 'desktop' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            💻 Desktop
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded text-xs font-medium flex items-center ${
              viewportMode === 'tablet' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            📱 Tablet
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded text-xs font-medium flex items-center ${
              viewportMode === 'mobile' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            📞 Mobile
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${!isPreviewMode ? 'bg-slate-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(true);
              setSelectedBlockId(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${isPreviewMode ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Preview
          </button>
          <span className="ml-2 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live responsive preview
          </span>
        </div>
      </div>

      {/* Dynamic Smart Snapping Guideline Overlays */}
      {snapEnabled && activeGuides.map((guide, idx) => (
        <div
          key={idx}
          className="absolute z-50 pointer-events-none border-dashed transition-all"
          style={{
            borderColor: '#ef4444',
            borderWidth: guide.orientation === 'VERTICAL' ? '0 0 0 1.5px' : '1.5px 0 0 0',
            left: guide.orientation === 'VERTICAL' ? `${guide.coordinate}px` : '0px',
            top: guide.orientation === 'HORIZONTAL' ? `${guide.coordinate}px` : '0px',
            width: guide.orientation === 'HORIZONTAL' ? '100%' : '1px',
            height: guide.orientation === 'VERTICAL' ? '100%' : '1px',
          }}
        />
      ))}

      {/* Multiplayer Collaborative Real-time Cursors */}
      {collaborators
        .filter((collab) => collab.userId !== myUserId)
        .map((collab) => (
          <div
            key={collab.userId}
            className="absolute z-50 pointer-events-none flex flex-col items-start transition-all duration-100 ease-out"
            style={{ left: `${collab.cursor.x}px`, top: `${collab.cursor.y}px` }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0 0V11L3.5 7.5L8 15L10 14L5.5 6.5L10 6.5L0 0Z" fill={collab.userId === 'user_peer_2' ? '#a855f7' : '#10b981'} />
            </svg>
            <span className={`text-[9px] text-white px-1.5 py-0.5 rounded shadow mt-1 font-semibold ${
              collab.userId === 'user_peer_2' ? 'bg-purple-500' : 'bg-emerald-500'
            }`}>
              {collab.userName}
            </span>
          </div>
        ))}

      {/* Interactive Editor Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation Panel with AI Suggestions Indicator */}
        {/* HARDENED MOBILE LAYOUT (Issue Resolution): Added hidden lg:flex to hide this useless bar on mobile screens */}
        <div className="hidden lg:flex w-16 border-r border-slate-900 bg-slate-950 flex flex-col items-center py-4 space-y-4 justify-between">
          <div className="flex flex-col space-y-4">
            <button className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold" title="Layout Canvas">💻</button>
            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl" title="Plugins Store">🔌</button>
            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl" title="Analytics Insights">📊</button>
            <button 
              onClick={() => setShowShortcutsCheatSheet(!showShortcutsCheatSheet)} 
              className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl" 
              title="Keyboard Shortcuts Cheat Sheet"
            >
              ⌨️
            </button>
          </div>
          
          <button 
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className="p-3 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-full animate-pulse shadow-md relative"
            title="AI Co-Authoring Assistant"
          >
            🤖
            {suggestions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {suggestions.length}
              </span>
            )}
          </button>
        </div>

        <LayersPanel />

        {/* Central Workspace Canvas Wrapper */}
        <div 
          ref={canvasRef} 
          className="flex-1 p-2 sm:p-8 overflow-auto flex justify-center items-start relative bg-[#050913] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
          onClick={() => setSelectedBlockId(null)}
        >
          <div 
            className={`transition-all duration-300 origin-top rounded-2xl shadow-2xl p-6 relative text-left ${getCanvasWidthClass()}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute top-3 right-3 text-[9px] text-slate-500 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Multiplayer Workspace Active</span>
            </div>
            
            {/* 🚀 LIVE BLOCK RENDERER INTEGRATION */}
            <div className="w-full min-h-[500px] h-full relative">
              <BlockRenderer
                blockId={schema.rootBlockId}
                schema={schema}
                viewport={viewportMode}
                selectedBlockId={selectedBlockId}
                onSelectBlock={isPreviewMode ? undefined : setSelectedBlockId}
                isEditorMode={!isPreviewMode}
              />
            </div>

            {/* Sandbox Widget */}
            {!isPreviewMode && (
              <div className="mt-8 border border-dashed border-purple-200 p-4 rounded-xl bg-purple-50/20">
                <span className="text-[10px] uppercase font-bold text-purple-600 block mb-2">🛡️ Isolated Capability-Based Sandbox Preview</span>
                <Sandbox 
                  id="preview_sandbox_widget" 
                  customHtml="<h3 style='color:#7c3aed;'>Safe Sandbox Render</h3><p style='font-size:12px; color:#6b7280;'>Third-party widgets cannot access parent app cookies or storage.</p>"
                  height="80px"
                />
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Cheat Sheet Floating Panel */}
          {showShortcutsCheatSheet && (
            <div className="absolute bottom-8 left-8 bg-slate-950 text-white p-4 rounded-xl shadow-2xl border border-slate-800 text-xs w-64 space-y-2 animate-fade-in z-50">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="font-bold">⌨️ Keyboard Shortcuts</span>
                <button onClick={() => setShowShortcutsCheatSheet(false)} className="text-gray-400">❌</button>
              </div>
              <div className="space-y-1.5 opacity-80 text-[11px]">
                <div className="flex justify-between"><span>Undo</span><kbd className="bg-slate-900 px-1.5 rounded">Ctrl+Z</kbd></div>
                <div className="flex justify-between"><span>Redo</span><kbd className="bg-slate-900 px-1.5 rounded">Ctrl+Shift+Z</kbd></div>
                <div className="flex justify-between"><span>Delete Block</span><kbd className="bg-slate-900 px-1.5 rounded">Del / Backspace</kbd></div>
                <div className="flex justify-between"><span>Deselect</span><kbd className="bg-slate-900 px-1.5 rounded">Esc</kbd></div>
              </div>
            </div>
          )}
        </div>

        {/* Sliding AI Co-Authoring Assistant Sidebar */}
        {isAiDrawerOpen && (
          <div className="w-80 border-l border-slate-900 bg-slate-950 h-full flex flex-col shadow-2xl animate-slide-in">
            <div className="p-4 border-b border-slate-900 bg-gradient-to-r from-purple-950/20 to-pink-950/20 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center">
                  <span className="mr-1">🤖</span> AI Design Co-Pilot
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Automated accessibility & SEO optimizer</p>
              </div>
              <button onClick={() => setIsAiDrawerOpen(false)} className="text-gray-400 hover:text-gray-400">❌</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-xs leading-relaxed space-y-2 ${
                    sug.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    sug.severity === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{sug.title}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 shadow-sm">{sug.severity}</span>
                  </div>
                  <p className="text-[10px] opacity-80">{sug.message}</p>
                  
                  {sug.suggestedActionPatch && (
                    <button 
                      onClick={() => handleApplyAiSuggestion(sug)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-3 py-1.5 rounded-lg w-full transition-colors text-[10px]"
                    >
                      🪄 Fix This Issue Automatically
                    </button>
                  )}
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="text-center text-gray-400 py-12 text-xs">
                  🎉 Outstanding job! Your page meets all accessibility and SEO constraints.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
