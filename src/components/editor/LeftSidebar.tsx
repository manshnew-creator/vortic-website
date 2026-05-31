'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { BaseBlock, BlockType, PageBuilderSchema } from '../../types/builder';
import { generateSecureId } from '../../lib/security/uuid';
import { toast } from '../ui/ToastProvider';

interface TemplateListItem {
  templateId: string;
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  previewPage?: string;
}

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
  {
    type: 'input',
    name: 'Form Input',
    description: 'Email, name, phone, or custom field',
    category: 'form',
    icon: '✍️',
    defaultProps: { name: 'email', label: 'Email Address', placeholder: 'you@example.com', inputType: 'email', required: true },
  },
  {
    type: 'textarea',
    name: 'Message Field',
    description: 'Multi-line form textarea',
    category: 'form',
    icon: '💬',
    defaultProps: { name: 'message', label: 'Message', placeholder: 'Tell us what you need...', required: false },
  },
  {
    type: 'submit-button',
    name: 'Submit Button',
    description: 'Form submit action button',
    category: 'form',
    icon: '✅',
    defaultProps: { label: 'Submit securely' },
  },
];

export const LeftSidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'layout' | 'content' | 'form'>('all');
  const [mode, setMode] = useState<'blocks' | 'templates'>('blocks');
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  
  const { schema, addBlock, selectedBlockId, initSchema } = useEditorStore();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/website/template');
        const payload = await response.json();
        if (payload.templates) setTemplates(payload.templates);
      } catch {
        toast({ title: 'Template library unavailable', description: 'Blocks remain available while the template API reconnects.', variant: 'warning' });
      }
    };

    loadTemplates();
  }, []);

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

    if (['input', 'textarea', 'submit-button'].includes(item.type)) {
      const selectedBlock = selectedBlockId ? schema.blocks[selectedBlockId] : null;
      const selectedFormId = selectedBlock?.type === 'form'
        ? selectedBlock.id
        : selectedBlock?.parentId && schema.blocks[selectedBlock.parentId]?.type === 'form'
          ? selectedBlock.parentId
          : null;

      if (selectedFormId) {
        parentId = selectedFormId;
      } else {
        const firstForm = Object.values(schema.blocks).find((block) => block.type === 'form');
        if (firstForm) parentId = firstForm.id;
      }
    }

    addBlock(newBlock, parentId);
  };

  const handleApplyTemplate = async (templateId: string) => {
    if (!schema || isApplyingTemplate) return;
    setIsApplyingTemplate(true);

    try {
      const response = await fetch(`/api/website/template?templateId=${encodeURIComponent(templateId)}`);
      if (!response.ok) throw new Error('Template request failed');
      const payload = await response.json();
      const templateSchema = payload.template?.schema;
      if (!templateSchema) throw new Error('Template schema missing');

      const nextSchema: PageBuilderSchema = {
        ...templateSchema,
        pageId: schema.pageId || 'landing_page_demo_1',
        slug: schema.slug || 'home',
        title: payload.template?.name || templateSchema.title || 'Template Page',
      };

      initSchema(nextSchema);
      window.localStorage.setItem('vortic:draft:landing_page_demo_1', JSON.stringify(nextSchema));
      toast({ title: 'Template applied', description: payload.template?.name || templateId, variant: 'success' });
    } catch {
      toast({ title: 'Could not apply template', description: 'Please retry or choose another template.', variant: 'error' });
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  const filteredItems = ITEMS_REGISTRY.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeTab === 'all' || item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const templateCategories = ['all', ...Array.from(new Set(templates.map((template) => template.category))).sort()];
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.templateId.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = templateCategory === 'all' || template.category === templateCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-screen max-w-sm lg:w-80 border-r border-gray-200 bg-white h-full flex flex-col select-none text-slate-800">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="mb-3 flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMode('blocks')}
            className={`flex-1 rounded-lg py-1.5 transition ${mode === 'blocks' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Blocks
          </button>
          <button
            type="button"
            onClick={() => setMode('templates')}
            className={`flex-1 rounded-lg py-1.5 transition ${mode === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Templates
          </button>
        </div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{mode === 'blocks' ? 'Add Elements' : 'Apply Template'}</h2>
        <div className="relative">
          <input
            type="text"
            placeholder={mode === 'blocks' ? 'Search blocks...' : 'Search 165 templates...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pl-8 bg-white"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Categories Tabs */}
      {mode === 'blocks' ? (
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
      ) : (
        <div className="border-b border-gray-200 bg-gray-50/50 p-2">
          <select
            value={templateCategory}
            onChange={(e) => setTemplateCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-[11px] font-bold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            {templateCategories.map((category) => (
              <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>
            ))}
          </select>
        </div>
      )}

      {/* Block / Template List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mode === 'blocks' ? (
          <>
            {filteredItems.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleAddBlock(item)}
                className="flex w-full items-start p-3 border border-gray-100 rounded-lg hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all duration-200 bg-white group text-left"
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
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-8">No matching blocks found.</div>
            )}
          </>
        ) : (
          <>
            <a href="/templates" target="_blank" className="block rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100">
              Browse full marketplace ↗
            </a>
            {filteredTemplates.map((template) => (
              <button
                key={template.templateId}
                type="button"
                disabled={isApplyingTemplate}
                onClick={() => handleApplyTemplate(template.templateId)}
                className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white text-left transition hover:border-indigo-500 hover:shadow-sm disabled:cursor-wait disabled:opacity-60"
              >
                <div className="aspect-video w-full overflow-hidden bg-white">
                  <iframe
                    src={template.previewPage || `/templates/preview/${encodeURIComponent(template.templateId)}`}
                    title={`${template.name} live preview`}
                    loading="lazy"
                    className="h-full w-full border-0"
                    sandbox="allow-scripts"
                  />
                </div>
                <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-black text-gray-900">{template.name}</h3>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500">{template.category}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-gray-500">{template.description}</p>
                <div className="mt-2 text-[9px] font-mono text-gray-400">{template.templateId}</div>
                </div>
              </button>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-8">No matching templates found.</div>
            )}
          </>
        )}
      </div>

      {/* Editor Guide Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 leading-normal">
        💡 <strong>Pro Tip:</strong> {mode === 'blocks' ? 'Select a container/form first to append elements inside it.' : 'Applying a template replaces the current canvas and keeps it as your local draft.'}
      </div>
    </div>
  );
};
