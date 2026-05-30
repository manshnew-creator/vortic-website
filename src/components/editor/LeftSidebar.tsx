'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BaseBlock, BlockType } from '../../types/builder';
import { generateSecureId } from '../../lib/security/uuid';

interface SidebarItem {
  type: BlockType;
  name: string;
  description: string;
  category: 'layout' | 'content' | 'form' | 'advanced';
  icon: string;
  defaultProps: Record<string, any>;
}

const ITEMS_REGISTRY: SidebarItem[] = [
  {
    type: 'section',
    name: 'Section',
    description: 'Full width outer wrapper section',
    category: 'layout',
    icon: '🔳',
    defaultProps: {},
  },
  {
    type: 'container',
    name: 'Container',
    description: 'Centered layout bounds block (1280px)',
    category: 'layout',
    icon: '📦',
    defaultProps: {},
  },
  {
    type: 'grid',
    name: 'CSS Grid',
    description: 'Grid layout structures',
    category: 'layout',
    icon: '📊',
    defaultProps: {},
  },
  {
    type: 'heading',
    name: 'Heading',
    description: 'SEO optimized title tags',
    category: 'content',
    icon: '🆎',
    defaultProps: { text: 'Title Headline Here', level: 2 },
  },
  {
    type: 'text',
    name: 'Paragraph Text',
    description: 'Paragraphs, bullet lists, rich text content',
    category: 'content',
    icon: '📝',
    defaultProps: { htmlContent: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>' },
  },
  {
    type: 'button',
    name: 'CTA Button',
    description: 'High-converting interactive CTA button',
    category: 'content',
    icon: '🔘',
    defaultProps: { label: 'Click to start', variant: 'primary', action: { type: 'url', url: 'https://arena.ai' } },
  },
  {
    type: 'image',
    name: 'Image Content',
    description: 'Upload or paste image links',
    category: 'content',
    icon: '🖼️',
    defaultProps: { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', alt: 'Marketing graphics' },
  },
  {
    type: 'video',
    name: 'Video player',
    description: 'Embed standard YouTube or direct MP4 video',
    category: 'content',
    icon: '🎥',
    defaultProps: { provider: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', autoplay: false, loop: false, muted: false, controls: true },
  },
  {
    type: 'form',
    name: 'Lead Generation Form',
    description: 'Lead collecting wrapper form',
    category: 'form',
    icon: '📋',
    defaultProps: { submitMethod: 'SUPABASE', successMessage: 'Success! We got your response.', errorMessage: 'Whoops! Please try again.' },
  },
];

export const LeftSidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'layout' | 'content' | 'form'>('all');
  
  const { schema, addBlock, selectedBlockId } = useEditorStore();

  const handleAddBlock = (item: SidebarItem) => {
    if (!schema) return;

    // Use cryptographically secure ID generation
    const blockId = generateSecureId(item.type);
    
    const newBlock: BaseBlock = {
      id: blockId,
      type: item.type,
      name: item.name,
      children: [],
      layout: {
        display: { desktop: item.type === 'grid' ? 'grid' : item.type === 'section' ? 'block' : 'block' },
        width: { desktop: '100%' },
        gridTemplateColumns: item.type === 'grid' ? { desktop: 'repeat(3, minmax(0, 1fr))' } : undefined,
        gap: item.type === 'grid' ? { desktop: '1.5rem' } : undefined,
      },
      spacing: {
        paddingTop: { desktop: '1.5rem' },
        paddingBottom: { desktop: '1.5rem' },
        paddingLeft: { desktop: '1rem' },
        paddingRight: { desktop: '1rem' },
      },
      typography: {
        fontSize: { desktop: '1rem' },
        color: '#1f2937',
      },
      border: { borderStyle: 'none' },
      shadow: {},
      animation: { type: 'none' },
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { ...item.defaultProps },
    };

    let parentId = schema.rootBlockId;
    if (selectedBlockId) {
      const selectedBlock = schema.blocks[selectedBlockId];
      if (selectedBlock && ['section', 'container', 'grid', 'form'].includes(selectedBlock.type)) {
        parentId = selectedBlockId;
      } else if (selectedBlock && selectedBlock.parentId) {
        parentId = selectedBlock.parentId;
      }
    }

    addBlock(newBlock, parentId);
  };

  const filteredItems = ITEMS_REGISTRY.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeTab === 'all' || item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 border-r border-gray-200 bg-white h-full flex flex-col select-none text-slate-800">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Elements</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pl-8 bg-white"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex border-b border-gray-200 px-2 bg-gray-50/50">
        {(['all', 'layout', 'content', 'form'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[11px] font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.type}
            onClick={() => handleAddBlock(item)}
            className="flex items-start p-3 border border-gray-100 rounded-lg hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all duration-200 bg-white group"
          >
            <div className="text-2xl mr-3 bg-gray-50 p-2 rounded-md group-hover:bg-blue-50 transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                {item.description}
              </p>
            </div>
            <span className="text-gray-400 group-hover:text-blue-500 text-xs self-center">➕</span>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">
            No matching blocks found.
          </div>
        )}
      </div>

      {/* Editor Guide Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 leading-normal">
        💡 <strong>Pro Tip:</strong> Select any block on the Canvas first to append elements directly inside it, or drag elements inside the navigator.
      </div>
    </div>
  );
};
