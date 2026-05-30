import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { ResponsiveValue } from '../../types/builder';

export const RightPanel: React.FC = () => {
  const {
    schema,
    selectedBlockId,
    viewportMode,
    updateBlockProps,
    updateBlockLayout,
    updateBlockSpacing,
    updateBlockTypography,
    updateBlockBorder,
    updateBlockVisibility,
    deleteBlock,
    duplicateBlock,
  } = useEditorStore();

  const [activeSubTab, setActiveSubTab] = useState<'props' | 'styles' | 'visibility'>('props');

  if (!schema || !selectedBlockId) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white h-full flex items-center justify-center p-6 text-center select-none">
        <div className="text-gray-400">
          <span className="text-3xl block mb-2">👈</span>
          <p className="text-xs">Select any element on the Canvas to configure properties and styles.</p>
        </div>
      </div>
    );
  }

  const block = schema.blocks[selectedBlockId];
  if (!block) return null;

  // Safe handlers for nested responsive configuration parameters
  const getResponsiveValue = <T,>(val: ResponsiveValue<T> | undefined): T | '' => {
    if (!val) return '';
    return val[viewportMode] !== undefined ? (val[viewportMode] as any) : '';
  };

  const updateResponsiveValue = <T,>(
    currentVal: ResponsiveValue<T> | undefined,
    newValue: T,
    updateFn: (val: ResponsiveValue<T>) => void
  ) => {
    const updated = currentVal ? { ...currentVal } : ({} as ResponsiveValue<T>);
    updated[viewportMode] = newValue;
    updateFn(updated);
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white h-full flex flex-col select-none text-xs text-gray-700">
      {/* Block Header Information */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {block.type}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">{block.id}</span>
        </div>
        <input
          type="text"
          value={block.name}
          onChange={(e) => useEditorStore.getState().updateBlock(block.id, { name: e.target.value })}
          className="font-bold text-sm text-gray-800 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none w-full py-0.5"
        />
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('props')}
          className={`flex-1 py-2 text-[11px] font-medium border-b-2 transition-colors ${
            activeSubTab === 'props' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Props
        </button>
        <button
          onClick={() => setActiveSubTab('styles')}
          className={`flex-1 py-2 text-[11px] font-medium border-b-2 transition-colors ${
            activeSubTab === 'styles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Styles
        </button>
        <button
          onClick={() => setActiveSubTab('visibility')}
          className={`flex-1 py-2 text-[11px] font-medium border-b-2 transition-colors ${
            activeSubTab === 'visibility' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Control Panel Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: CUSTOM ELEMENT PROPS */}
        {activeSubTab === 'props' && (
          <div className="space-y-4">
            {block.type === 'heading' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Heading Text</label>
                  <input
                    type="text"
                    value={block.props.text || ''}
                    onChange={(e) => updateBlockProps(block.id, { text: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Heading Level</label>
                  <select
                    value={block.props.level || 2}
                    onChange={(e) => updateBlockProps(block.id, { level: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => (
                      <option key={l} value={l}>H{l}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {block.type === 'text' && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">HTML Rich Content</label>
                <textarea
                  rows={8}
                  value={block.props.htmlContent || ''}
                  onChange={(e) => updateBlockProps(block.id, { htmlContent: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-[10px]"
                />
              </div>
            )}

            {block.type === 'button' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={block.props.label || ''}
                    onChange={(e) => updateBlockProps(block.id, { label: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Button Theme Variant</label>
                  <select
                    value={block.props.variant || 'primary'}
                    onChange={(e) => updateBlockProps(block.id, { variant: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="primary">Primary Solid</option>
                    <option value="secondary">Secondary Light</option>
                    <option value="outline">Border Outline</option>
                    <option value="ghost">Ghost Plain</option>
                    <option value="link">Underlined Link</option>
                  </select>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <span className="block text-[11px] font-bold text-gray-700 mb-2">Interactivity Action</span>
                  <div className="space-y-2 bg-gray-50 p-2.5 rounded border border-gray-100">
                    <div>
                      <label className="block text-[9px] font-semibold text-gray-500 uppercase">Action Type</label>
                      <select
                        value={block.props.action?.type || 'none'}
                        onChange={(e) =>
                          updateBlockProps(block.id, {
                            action: { ...block.props.action, type: e.target.value },
                          })
                        }
                        className="w-full px-1.5 py-1 border border-gray-200 rounded text-[11px] bg-white mt-1"
                      >
                        <option value="none">No Action</option>
                        <option value="url">External Link (URL)</option>
                        <option value="scroll">Smooth Anchor Scroll</option>
                        <option value="email">Send Email (mailto)</option>
                      </select>
                    </div>
                    {block.props.action?.type === 'url' && (
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-500 uppercase">Target URL</label>
                        <input
                          type="text"
                          placeholder="https://arena.ai"
                          value={block.props.action?.url || ''}
                          onChange={(e) =>
                            updateBlockProps(block.id, {
                              action: { ...block.props.action, url: e.target.value },
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] mt-1"
                        />
                      </div>
                    )}
                    {block.props.action?.type === 'scroll' && (
                      <div>
                        <label className="block text-[9px] font-semibold text-gray-500 uppercase">Section ID Target</label>
                        <input
                          type="text"
                          placeholder="section_feature_block"
                          value={block.props.action?.anchorId || ''}
                          onChange={(e) =>
                            updateBlockProps(block.id, {
                              action: { ...block.props.action, anchorId: e.target.value },
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {block.type === 'image' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Image URL source</label>
                  <input
                    type="text"
                    value={block.props.src || ''}
                    onChange={(e) => updateBlockProps(block.id, { src: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Alt Accessibility Text</label>
                  <input
                    type="text"
                    value={block.props.alt || ''}
                    onChange={(e) => updateBlockProps(block.id, { alt: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {block.type === 'video' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Provider Type</label>
                  <select
                    value={block.props.provider || 'youtube'}
                    onChange={(e) => updateBlockProps(block.id, { provider: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="youtube">YouTube Embed</option>
                    <option value="html5">Direct HTML5 MP4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Video Source URL</label>
                  <input
                    type="text"
                    value={block.props.url || ''}
                    onChange={(e) => updateBlockProps(block.id, { url: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={block.props.autoplay || false}
                      onChange={(e) => updateBlockProps(block.id, { autoplay: e.target.checked })}
                    />
                    <span>Autoplay</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={block.props.loop || false}
                      onChange={(e) => updateBlockProps(block.id, { loop: e.target.checked })}
                    />
                    <span>Loop</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={block.props.muted || false}
                      onChange={(e) => updateBlockProps(block.id, { muted: e.target.checked })}
                    />
                    <span>Mute</span>
                  </label>
                </div>
              </>
            )}

            {block.type === 'form' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Form Submit Action Method</label>
                  <select
                    value={block.props.submitMethod || 'SUPABASE'}
                    onChange={(e) => updateBlockProps(block.id, { submitMethod: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="SUPABASE">Supabase DB Leads Collection</option>
                    <option value="POST">API Endpoint (POST)</option>
                  </select>
                </div>
                {block.props.submitMethod === 'POST' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">API target Endpoint</label>
                    <input
                      type="text"
                      placeholder="https://domain.com/api/forms/..."
                      value={block.props.actionUrl || ''}
                      onChange={(e) => updateBlockProps(block.id, { actionUrl: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Form Success Alert Message</label>
                  <input
                    type="text"
                    value={block.props.successMessage || ''}
                    onChange={(e) => updateBlockProps(block.id, { successMessage: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: POWERFUL DESIGN STYLES PANEL */}
        {activeSubTab === 'styles' && (
          <div className="space-y-4">
            {/* Viewport Notice Badge */}
            <div className="bg-yellow-50 text-yellow-700 p-2 rounded border border-yellow-100 text-[10px]">
              ✏️ Styles edited here apply explicitly to <strong>{viewportMode} viewport</strong> resolution layout.
            </div>

            {/* Typography Styles */}
            <div className="border-b border-gray-100 pb-3">
              <span className="block font-bold text-[11px] text-gray-600 mb-2">Typography</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.25rem"
                    value={getResponsiveValue(block.typography?.fontSize)}
                    onChange={(e) =>
                      updateResponsiveValue(block.typography?.fontSize, e.target.value, (val) =>
                        updateBlockTypography(block.id, { fontSize: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Color</label>
                  <div className="flex space-x-1">
                    <input
                      type="color"
                      value={block.typography?.color || '#000000'}
                      onChange={(e) => updateBlockTypography(block.id, { color: e.target.value })}
                      className="w-6 h-6 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={block.typography?.color || '#000000'}
                      onChange={(e) => updateBlockTypography(block.id, { color: e.target.value })}
                      className="w-full px-1.5 py-0.5 border border-gray-200 rounded text-[10px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Weight</label>
                  <input
                    type="text"
                    placeholder="normal/bold/700"
                    value={getResponsiveValue(block.typography?.fontWeight)}
                    onChange={(e) =>
                      updateResponsiveValue(block.typography?.fontWeight, e.target.value, (val) =>
                        updateBlockTypography(block.id, { fontWeight: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Align</label>
                  <select
                    value={getResponsiveValue(block.typography?.textAlign)}
                    onChange={(e) =>
                      updateResponsiveValue(block.typography?.textAlign, e.target.value as any, (val) =>
                        updateBlockTypography(block.id, { textAlign: val })
                      )
                    }
                    className="w-full px-1.5 py-1 border border-gray-200 rounded bg-white"
                  >
                    <option value="">Default</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Box Parameters */}
            <div className="border-b border-gray-100 pb-3">
              <span className="block font-bold text-[11px] text-gray-600 mb-2">Display & Sizing</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Display</label>
                  <select
                    value={getResponsiveValue(block.layout?.display)}
                    onChange={(e) =>
                      updateResponsiveValue(block.layout?.display, e.target.value as any, (val) =>
                        updateBlockLayout(block.id, { display: val })
                      )
                    }
                    className="w-full px-1.5 py-1 border border-gray-200 rounded bg-white"
                  >
                    <option value="block">Block</option>
                    <option value="flex">Flexbox</option>
                    <option value="grid">CSS Grid</option>
                    <option value="none">Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Bg Color</label>
                  <input
                    type="text"
                    placeholder="e.g. #f3f4f6"
                    value={block.layout?.backgroundColor || ''}
                    onChange={(e) => updateBlockLayout(block.id, { backgroundColor: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Width</label>
                  <input
                    type="text"
                    placeholder="100% or auto"
                    value={getResponsiveValue(block.layout?.width)}
                    onChange={(e) =>
                      updateResponsiveValue(block.layout?.width, e.target.value, (val) =>
                        updateBlockLayout(block.id, { width: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Min Height</label>
                  <input
                    type="text"
                    placeholder="e.g. 100px"
                    value={getResponsiveValue(block.layout?.minHeight)}
                    onChange={(e) =>
                      updateResponsiveValue(block.layout?.minHeight, e.target.value, (val) =>
                        updateBlockLayout(block.id, { minHeight: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Padding & Margins Spacing */}
            <div className="border-b border-gray-100 pb-3">
              <span className="block font-bold text-[11px] text-gray-600 mb-2">Outer / Inner Spacing</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Padding Top</label>
                  <input
                    type="text"
                    placeholder="0rem"
                    value={getResponsiveValue(block.spacing?.paddingTop)}
                    onChange={(e) =>
                      updateResponsiveValue(block.spacing?.paddingTop, e.target.value, (val) =>
                        updateBlockSpacing(block.id, { paddingTop: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Padding Bottom</label>
                  <input
                    type="text"
                    placeholder="0rem"
                    value={getResponsiveValue(block.spacing?.paddingBottom)}
                    onChange={(e) =>
                      updateResponsiveValue(block.spacing?.paddingBottom, e.target.value, (val) =>
                        updateBlockSpacing(block.id, { paddingBottom: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Margin Top</label>
                  <input
                    type="text"
                    placeholder="0rem"
                    value={getResponsiveValue(block.spacing?.marginTop)}
                    onChange={(e) =>
                      updateResponsiveValue(block.spacing?.marginTop, e.target.value, (val) =>
                        updateBlockSpacing(block.id, { marginTop: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Margin Bottom</label>
                  <input
                    type="text"
                    placeholder="0rem"
                    value={getResponsiveValue(block.spacing?.marginBottom)}
                    onChange={(e) =>
                      updateResponsiveValue(block.spacing?.marginBottom, e.target.value, (val) =>
                        updateBlockSpacing(block.id, { marginBottom: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Border Properties */}
            <div>
              <span className="block font-bold text-[11px] text-gray-600 mb-2">Borders & Corners</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Style</label>
                  <select
                    value={block.border?.borderStyle || 'none'}
                    onChange={(e) => updateBlockBorder(block.id, { borderStyle: e.target.value as any })}
                    className="w-full px-1.5 py-1 border border-gray-200 rounded bg-white"
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-gray-400">Border Radius</label>
                  <input
                    type="text"
                    placeholder="e.g. 8px"
                    value={getResponsiveValue(block.border?.borderRadius)}
                    onChange={(e) =>
                      updateResponsiveValue(block.border?.borderRadius, e.target.value, (val) =>
                        updateBlockBorder(block.id, { borderRadius: val })
                      )
                    }
                    className="w-full px-2 py-1 border border-gray-200 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISIBILITY CONTROLS & RBAC */}
        {activeSubTab === 'visibility' && (
          <div className="space-y-4">
            <span className="block font-bold text-[11px] text-gray-600 mb-1">Responsive View Rules</span>
            <p className="text-[10px] text-gray-400 mb-3 leading-snug">Toggle which viewport width scales render this element block configuration in production.</p>

            <div className="space-y-3 bg-gray-50 p-3 rounded border border-gray-100">
              <label className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Show on Desktop</span>
                <input
                  type="checkbox"
                  checked={block.visibility?.showOnDesktop}
                  onChange={(e) => updateBlockVisibility(block.id, { showOnDesktop: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Show on Tablet</span>
                <input
                  type="checkbox"
                  checked={block.visibility?.showOnTablet}
                  onChange={(e) => updateBlockVisibility(block.id, { showOnTablet: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Show on Mobile</span>
                <input
                  type="checkbox"
                  checked={block.visibility?.showOnMobile}
                  onChange={(e) => updateBlockVisibility(block.id, { showOnMobile: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Control Actions Footer (Delete/Duplicate) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex space-x-2">
        <button
          onClick={() => duplicateBlock(block.id)}
          className="flex-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 rounded font-medium transition-colors"
        >
          👯 Duplicate
        </button>
        <button
          onClick={() => deleteBlock(block.id)}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded font-medium transition-colors"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};
