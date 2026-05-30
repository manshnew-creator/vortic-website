'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { VisualLayoutEngine, BoundingBox, SnapGuide } from '../../lib/editor/layoutEngine';
import { AIAuthoringEngine, AuthoringSuggestion } from '../../lib/ai/authoring';
import { CollaborationPresenceEngine, ClientPresence } from '../../lib/collaboration/presence';
import { Sandbox } from '../renderer/Sandbox';

export const VisualEditorBridge: React.FC = () => {
  const { schema, viewportMode, selectedBlockId, setSelectedBlockId, updateBlockProps } = useEditorStore();
  
  // Real-time Canvas States
  const [collaborators, setCollaborators] = useState<ClientPresence[]>([]);
  const [suggestions, setSuggestions] = useState<AuthoringSuggestion[]>([]);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [showShortcutsCheatSheet, setShowShortcutsCheatSheet] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const myUserId = 'user_curr_designer_1';

  // 1. Live Collaboration & Cursor Broadcasting Loop
  useEffect(() => {
    // Announce my presence initially
    CollaborationPresenceEngine.updatePresence(myUserId, {
      userId: myUserId,
      userName: 'Principal Designer (You)',
      cursor: { x: 0, y: 0 },
      activeBlockId: selectedBlockId,
    });

    // Mock active secondary peer collaborators to demonstrate real-time multiplayer cursors
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

  // 4. Simulate element dragging physics and apply Smart Snapping guidelines
  const handleSimulatedElementDrag = (blockId: string, currentX: number, currentY: number) => {
    if (!schema) return;

    const targetBlock = schema.blocks[blockId];
    if (!targetBlock) return;

    // Define bounding box of dragged item
    const draggedBox = { x: currentX, y: currentY, width: 250, height: 80 };

    // Map sibling boxes for bounding comparisons
    const siblingBoxes: BoundingBox[] = Object.entries(schema.blocks)
      .filter(([id]) => id !== blockId && id !== schema.rootBlockId)
      .map(([id, b]) => ({
        id,
        x: id === 'hero_heading' ? 100 : 150, // mock canvas absolute coordinate positions
        y: id === 'hero_heading' ? 150 : 300,
        width: 300,
        height: 100,
      }));

    // Trigger physical snapping coordinates resolver
    const { snapX, snapY, guides } = VisualLayoutEngine.solveSmartSnapping(draggedBox, siblingBoxes);

    setActiveGuides(guides);

    // Apply snap lock offsets if within threshold limits
    const finalX = snapX !== null ? snapX : currentX;
    const finalY = snapY !== null ? snapY : currentY;

    console.log(`🧭 [Smart Snapping Physics] Element adjusted to coordinates: X=${finalX}px, Y=${finalY}px`);
  };

  const handleApplyAiSuggestion = (suggestion: AuthoringSuggestion) => {
    if (suggestion.blockId && suggestion.suggestedActionPatch) {
      updateBlockProps(suggestion.blockId, suggestion.suggestedActionPatch);
      alert(`Applied AI optimization: ${suggestion.title}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-gray-50 font-sans" onMouseMove={handleCanvasMouseMove}>
      
      {/* Dynamic Smart Snapping Guideline Overlays */}
      {activeGuides.map((guide, idx) => (
        <div
          key={idx}
          className="absolute z-50 pointer-events-none border-dashed transition-all"
          style={{
            borderColor: '#ef4444', // Beautiful design system accent red snapping line
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
            {/* SVG Cursor Pointer */}
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
        <div className="w-16 border-r border-gray-200 bg-white flex flex-col items-center py-4 space-y-4 justify-between">
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

        {/* Central Workspace Canvas Wrapper */}
        <div ref={canvasRef} className="flex-1 p-8 overflow-auto flex justify-center items-start relative select-none">
          <div className="bg-white shadow-2xl rounded-xl border border-gray-200 w-full max-w-4xl min-h-[600px] p-6 relative">
            <div className="absolute top-3 right-3 text-[10px] text-gray-400 flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>Multiplayer Workspace Active</span>
            </div>
            
            {/* Render Sandbox Placeholder */}
            <div className="mt-8 border border-dashed border-purple-200 p-4 rounded-xl bg-purple-50/20">
              <span className="text-[10px] uppercase font-bold text-purple-600 block mb-2">🛡️ Isolated Capability-Based Sandbox Preview</span>
              <Sandbox 
                id="preview_sandbox_widget" 
                customHtml="<h3 style='color:#7c3aed;'>Safe Sandbox Render</h3><p style='font-size:12px; color:#6b7280;'>Third-party widgets cannot access parent app cookies or storage.</p>"
                height="80px"
              />
            </div>
          </div>

          {/* Keyboard Shortcuts Cheat Sheet Floating Panel */}
          {showShortcutsCheatSheet && (
            <div className="absolute bottom-8 left-8 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800 text-xs w-64 space-y-2 animate-fade-in z-50">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="font-bold">⌨️ Keyboard Shortcuts</span>
                <button onClick={() => setShowShortcutsCheatSheet(false)} className="text-gray-400">❌</button>
              </div>
              <div className="space-y-1.5 opacity-80 text-[11px]">
                <div className="flex justify-between"><span>Undo</span><kbd className="bg-slate-800 px-1.5 rounded">Ctrl+Z</kbd></div>
                <div className="flex justify-between"><span>Redo</span><kbd className="bg-slate-800 px-1.5 rounded">Ctrl+Shift+Z</kbd></div>
                <div className="flex justify-between"><span>Delete Block</span><kbd className="bg-slate-800 px-1.5 rounded">Del / Backspace</kbd></div>
                <div className="flex justify-between"><span>Deselect</span><kbd className="bg-slate-800 px-1.5 rounded">Esc</kbd></div>
              </div>
            </div>
          )}
        </div>

        {/* Sliding AI Co-Authoring Assistant Sidebar */}
        {isAiDrawerOpen && (
          <div className="w-80 border-l border-gray-200 bg-white h-full flex flex-col shadow-2xl animate-slide-in">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-sm flex items-center">
                  <span className="mr-1">🤖</span> AI Design Co-Pilot
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Automated accessibility & SEO optimizer</p>
              </div>
              <button onClick={() => setIsAiDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">❌</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {suggestions.map((sug, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-xs leading-relaxed space-y-2 ${
                    sug.severity === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-900' :
                    sug.severity === 'WARNING' ? 'bg-yellow-50 border-yellow-100 text-yellow-900' :
                    'bg-blue-50 border-blue-100 text-blue-900'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{sug.title}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white shadow-sm">{sug.severity}</span>
                  </div>
                  <p className="text-[10px] opacity-80">{sug.message}</p>
                  
                  {sug.suggestedActionPatch && (
                    <button 
                      onClick={() => handleApplyAiSuggestion(sug)}
                      className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold px-3 py-1.5 rounded-lg w-full transition-colors text-[10px]"
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
