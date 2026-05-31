'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { LeftSidebar } from './LeftSidebar';
import { VisualEditorBridge } from './VisualEditorBridge';
import { RightPanel } from './RightPanel';
import { PageBuilderSchema } from '../../types/builder';
import { toast } from '../ui/ToastProvider';
import { CommandPalette } from './CommandPalette';

// Mock Initial Landing Page Builder Schema
const MOCK_INITIAL_SCHEMA: PageBuilderSchema = {
  version: '1.0.0',
  pageId: 'landing_page_demo_1',
  title: 'My Launch Landing Page',
  slug: 'home',
  seo: {
    title: 'High Converting Landing Page Builder',
    description: 'Build robust high performance SaaS pages with no-code.',
    keywords: 'builder, design, react, next.js, landing page',
  },
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  },
  rootBlockId: 'root_block',
  blocks: {
    root_block: {
      id: 'root_block',
      type: 'container',
      name: 'Root Layout Wrapper',
      parentId: null,
      children: ['hero_section'],
      layout: { display: { desktop: 'block' }, width: { desktop: '100%' } },
      spacing: { paddingTop: { desktop: '0px' }, paddingBottom: { desktop: '0px' } },
      typography: {},
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    },
    hero_section: {
      id: 'hero_section',
      type: 'section',
      name: 'Hero Section',
      parentId: 'root_block',
      children: ['hero_container'],
      layout: {
        backgroundColor: '#f9fafb',
        backgroundImage: '',
        display: { desktop: 'block' },
      },
      spacing: {
        paddingTop: { desktop: '6rem', mobile: '3rem' },
        paddingBottom: { desktop: '6rem', mobile: '3rem' },
      },
      typography: {},
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    },
    hero_container: {
      id: 'hero_container',
      type: 'container',
      name: 'Hero Container Box',
      parentId: 'hero_section',
      children: ['hero_heading', 'hero_paragraph', 'hero_cta_button'],
      layout: {
        display: { desktop: 'flex' },
        flexDirection: { desktop: 'column' },
        justifyContent: { desktop: 'center' },
        alignItems: { desktop: 'center' },
      },
      spacing: {
        paddingLeft: { desktop: '1.5rem' },
        paddingRight: { desktop: '1.5rem' },
      },
      typography: {
        textAlign: { desktop: 'center' },
      },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    },
    hero_heading: {
      id: 'hero_heading',
      type: 'heading',
      name: 'Hero Main Title',
      parentId: 'hero_container',
      children: [],
      layout: {},
      spacing: {
        marginBottom: { desktop: '1.5rem' },
      },
      typography: {
        fontSize: { desktop: '3.5rem', mobile: '2.25rem' },
        color: '#111827',
        fontWeight: { desktop: '800' },
        lineHeight: { desktop: '1.15' },
      },
      border: {},
      shadow: {},
      animation: { type: 'slide-up', duration: 800 },
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {
        text: 'Build High-Converting SaaS Landers in Record Time',
        level: 1,
      },
    },
    hero_paragraph: {
      id: 'hero_paragraph',
      type: 'text',
      name: 'Hero Subtext Paragraph',
      parentId: 'hero_container',
      children: [],
      layout: {},
      spacing: {
        marginBottom: { desktop: '2rem' },
      },
      typography: {
        fontSize: { desktop: '1.25rem', mobile: '1.1rem' },
        color: '#4b5563',
        lineHeight: { desktop: '1.6' },
      },
      border: {},
      shadow: {},
      animation: { type: 'fade-in', duration: 1000 },
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {
        htmlContent: '<p>Empower your marketing team to craft stunning, lightning-fast layouts without waiting on developer backlogs. High-performance design made easy.</p>',
      },
    },
    hero_cta_button: {
      id: 'hero_cta_button',
      type: 'button',
      name: 'Hero CTA Button',
      parentId: 'hero_container',
      children: [],
      layout: {},
      spacing: {},
      typography: {},
      border: {
        borderRadius: { desktop: '0.375rem' },
      },
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {
        label: 'Get Started Absolutely Free',
        variant: 'primary',
        action: {
          type: 'url',
          url: 'https://arena.ai',
          target: '_blank',
        },
      },
    },
  },
};

export const VisualEditor: React.FC = () => {
  const { schema, initSchema, undo, redo, history, historyIndex, hasUnsavedChanges, isSaving, setSaving, markSaved, deleteBlock, setSelectedBlockId } = useEditorStore();
  const importInputRef = React.useRef<HTMLInputElement>(null);

  // ADAPTIVE MOBILE LAYOUT SYSTEM (حل مشكلة تداخل الصفحات والتصميم على الجوال)
  // Allows small/mobile screens to toggle smoothly between active editing views
  const [activeTab, setActiveTab] = useState<'canvas' | 'elements' | 'styles'>('canvas');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load a requested template from /editor?template=... first; otherwise restore latest local draft.
  useEffect(() => {
    let cancelled = false;

    const loadInitialSchema = async () => {
      const requestedTemplateId = new URLSearchParams(window.location.search).get('template');

      if (requestedTemplateId) {
        try {
          const response = await fetch(`/api/website/template?templateId=${encodeURIComponent(requestedTemplateId)}`);
          if (!response.ok) throw new Error('Template request failed');
          const payload = await response.json();
          const templateSchema = payload.template?.schema;
          if (!templateSchema) throw new Error('Template schema missing');

          const nextSchema: PageBuilderSchema = {
            ...templateSchema,
            pageId: 'landing_page_demo_1',
            slug: 'home',
            title: payload.template?.name || templateSchema.title || 'Template Page',
          };

          if (!cancelled) {
            initSchema(nextSchema);
            window.localStorage.setItem('vortic:draft:landing_page_demo_1', JSON.stringify(nextSchema));
            toast({ title: 'Template applied', description: payload.template?.name || requestedTemplateId, variant: 'success' });
          }
          return;
        } catch {
          toast({ title: 'Template could not be loaded', description: 'Opening your latest saved draft instead.', variant: 'warning' });
        }
      }

      try {
        const cachedDraft = window.localStorage.getItem('vortic:draft:landing_page_demo_1');
        if (!cancelled) initSchema(cachedDraft ? JSON.parse(cachedDraft) : MOCK_INITIAL_SCHEMA);
      } catch {
        if (!cancelled) initSchema(MOCK_INITIAL_SCHEMA);
      }
    };

    loadInitialSchema();
    return () => { cancelled = true; };
  }, [initSchema]);

  useEffect(() => {
    if (!schema) return;
    try {
      window.localStorage.setItem('vortic:draft:landing_page_demo_1', JSON.stringify(schema));
    } catch {
      // Ignore storage quota issues; remote autosave remains the source of truth.
    }
  }, [schema]);

  // Autosave Simulator Hook
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !schema) return;

    const handler = setTimeout(async () => {
      const snapshot = JSON.stringify(schema);
      setSaving(true);
      try {
        const response = await fetch('/api/website/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schema }),
        });

        if (!response.ok) throw new Error('Autosave endpoint rejected the draft.');

        if (JSON.stringify(useEditorStore.getState().schema) === snapshot) {
          markSaved();
        } else {
          setSaving(false);
        }
      } catch {
        setSaving(false);
        toast({
          title: 'Autosave paused',
          description: 'Your edits are still safe in the editor. Connect the database or retry when the API is reachable.',
          variant: 'warning',
        });
      }
    }, 3000);

    return () => clearTimeout(handler);
  }, [schema, hasUnsavedChanges, isSaving, setSaving, markSaved]);

  // Keyboard Shortcuts (Undo/Redo/Delete/Escape) with form-field safety guards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = (!!target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) || !!target?.isContentEditable;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (isTyping) return;

      if (e.key === 'Escape') {
        setSelectedBlockId(null);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && useEditorStore.getState().selectedBlockId) {
        e.preventDefault();
        const selectedId = useEditorStore.getState().selectedBlockId;
        if (selectedId) deleteBlock(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteBlock, setSelectedBlockId]);

  const handleExportSchema = () => {
    if (!schema) return;
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${schema.slug || 'vortic-page'}.schema.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Schema exported', description: 'Your page JSON is ready for backup or migration.', variant: 'success' });
  };

  const handleImportSchema = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as PageBuilderSchema;
      if (!imported.rootBlockId || !imported.blocks?.[imported.rootBlockId]) throw new Error('Invalid schema');
      initSchema({ ...imported, pageId: schema?.pageId || imported.pageId || 'landing_page_demo_1' });
      toast({ title: 'Schema imported', description: imported.title || 'Imported page', variant: 'success' });
    } catch {
      toast({ title: 'Invalid schema file', description: 'Please choose a valid Vortic page JSON file.', variant: 'error' });
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleResetDraft = () => {
    window.localStorage.removeItem('vortic:draft:landing_page_demo_1');
    initSchema(MOCK_INITIAL_SCHEMA);
    toast({ title: 'Draft reset', description: 'The starter layout has been restored.', variant: 'info' });
  };

  const handlePublish = async () => {
    if (!schema) return;
    setSaving(true);
    try {
      const response = await fetch('/api/website/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: schema.pageId, content: schema }),
      });
      if (!response.ok) throw new Error('Publish endpoint rejected the request.');
      const result = await response.json().catch(() => ({}));
      toast({
        title: 'Site published to the Edge',
        description: result.jobId ? `Deployment job queued: ${result.jobId}` : 'Optimized static assets are being generated now.',
        variant: 'success',
      });
      markSaved();
    } catch {
      setSaving(false);
      toast({
        title: 'Publish could not be completed',
        description: 'Check database/queue credentials, then try again. No draft changes were lost.',
        variant: 'error',
      });
    }
  };

  const commandPaletteCommands = [
    {
      id: 'publish',
      title: 'Publish site',
      description: 'Queue the current page for publishing.',
      shortcut: 'Ctrl+P',
      icon: '🚀',
      run: () => void handlePublish(),
    },
    {
      id: 'export',
      title: 'Export schema',
      description: 'Download this page as a Vortic JSON schema.',
      shortcut: 'JSON',
      icon: '📤',
      run: handleExportSchema,
    },
    {
      id: 'import',
      title: 'Import schema',
      description: 'Import a Vortic JSON page schema from your device.',
      icon: '📥',
      run: () => importInputRef.current?.click(),
    },
    {
      id: 'reset',
      title: 'Reset current draft',
      description: 'Restore the starter page and clear local draft storage.',
      icon: '♻️',
      run: handleResetDraft,
    },
    {
      id: 'templates',
      title: 'Open templates marketplace',
      description: 'Browse all 165 professional templates.',
      icon: '🧩',
      run: () => window.open('/templates', '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'dashboard',
      title: 'Open dashboard',
      description: 'Go to the Vortic workspace dashboard.',
      icon: '📊',
      run: () => { window.location.href = '/dashboard'; },
    },
    {
      id: 'analytics',
      title: 'Open analytics',
      description: 'View conversion and traffic analytics.',
      icon: '📈',
      run: () => { window.location.href = '/dashboard/analytics'; },
    },
    {
      id: 'deselect',
      title: 'Deselect block',
      description: 'Clear the current canvas selection.',
      shortcut: 'Esc',
      icon: '⌫',
      run: () => setSelectedBlockId(null),
    },
  ];

  return (
    <div className="w-full h-dvh flex flex-col overflow-hidden bg-slate-950 font-sans text-slate-100">
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commandPaletteCommands}
      />
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-4 z-20">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
            V
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black text-white leading-none">vortic workspace</h1>
            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Vext™ compiler</span>
          </div>
        </div>

        {/* Undo, Redo, Autosave Indicators */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:inline-flex rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Command palette (Ctrl/Cmd+K)"
          >
            ⌘K
          </button>

          <div className="hidden sm:flex items-center space-x-1 border-r border-slate-800 pr-3">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1 hover:bg-slate-900 rounded disabled:opacity-30 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              ↩️
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 hover:bg-slate-900 rounded disabled:opacity-30 transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              ↪️
            </button>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
            {isSaving ? (
              <span className="text-amber-400 animate-pulse">Saving...</span>
            ) : hasUnsavedChanges ? (
              <span className="text-indigo-400">Unsaved</span>
            ) : (
              <span className="text-emerald-400">Saved</span>
            )}
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => handleImportSchema(event.target.files?.[0])}
          />
          <div className="hidden md:flex items-center gap-1 border-r border-slate-800 pr-3">
            <button
              onClick={handleExportSchema}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider"
            >
              Export
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider"
            >
              Import
            </button>
            <button
              onClick={handleResetDraft}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider"
            >
              Reset
            </button>
          </div>

          <button
            onClick={handlePublish}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-600/10 transition-all flex items-center uppercase tracking-wider"
          >
            🚀 Publish
          </button>
        </div>
      </header>

      {/* MOBILE ADAPTIVE WORKSPACE TABS SWITCHER (حاسم للشاشات الصغيرة والجوال) */}
      <div className="flex lg:hidden bg-slate-950 border-b border-slate-900 text-xs font-bold font-mono">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'canvas' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'
          }`}
        >
          🎨 Canvas
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'elements' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'
          }`}
        >
          ➕ Elements
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-3 border-b-2 transition-colors ${
            activeTab === 'styles' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'
          }`}
        >
          ⚙️ Styles
        </button>
      </div>

      {/* Editor Main Content Area Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar - Rendered always on Desktop, toggled on Mobile */}
        <div className={`${activeTab === 'elements' ? 'flex' : 'hidden'} lg:flex h-full border-r border-slate-900`}>
          <LeftSidebar />
        </div>

        {/* Dynamic, Real-time Visual Editor Bridge & Constraints Canvas */}
        <div className={`${activeTab === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 h-full`}>
          <VisualEditorBridge />
        </div>

        {/* Right properties configuration */}
        <div className={`${activeTab === 'styles' ? 'flex' : 'hidden'} lg:flex h-full border-l border-slate-900`}>
          <RightPanel />
        </div>
        
      </div>
    </div>
  );
};
