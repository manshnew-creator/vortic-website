import React, { useState } from 'react';
import { TEMPLATES_REGISTRY, LandingPageTemplate } from '../../lib/theme/templates';

type OnboardingStep = 'SIGNUP' | 'TEMPLATE_SELECT' | 'AI_CUSTOMIZE' | 'PUBLISH_LIVE';

export const OnboardingFunnel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('SIGNUP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<LandingPageTemplate | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdPageId, setCreatedPageId] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // STEP 1: FAST SIGNUP
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all account fields.');
      return;
    }
    setErrorMsg(null);
    setCurrentStep('TEMPLATE_SELECT');
  };

  // STEP 2: SELECT TEMPLATE
  const handleSelectTemplate = (template: LandingPageTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('AI_CUSTOMIZE');
  };

  // STEP 3: AI CUSTOMIZE & DYNAMIC INSTANTIATION
  const handleAiCustomize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // A. Instantiate Template Page via Backend API
      const templateResponse = await fetch('/api/website/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.templateId,
          websiteId: 'website_demo_1', // Mocked active website context
        }),
      });

      const templateData = await templateResponse.json();
      if (!templateResponse.ok) {
        throw new Error(templateData.error || 'Failed to instantiate template.');
      }

      const pageId = templateData.pageId;
      setCreatedPageId(pageId);

      // B. Adapt Page Schema using the AI-assisted Workflow API (Spelling Autocorrector + Localized copywriter)
      if (aiPrompt.trim()) {
        const aiResponse = await fetch('/api/website/ai-adapt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId,
            prompt: aiPrompt,
          }),
        });

        const aiData = await aiResponse.json();
        if (!aiResponse.ok) {
          console.warn('AI adaptation warning, proceeding with base template:', aiData.warning);
        }
      }

      // C. Compile and Publish Static HTML directly to the Edge CDN API
      const publishResponse = await fetch('/api/website/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          content: templateData.schema,
        }),
      });

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) {
        throw new Error(publishData.error || 'Failed to publish to Edge CDN.');
      }

      // Generate the final live-published edge serving URL
      setLiveUrl(`https://demo.saaslander.com/${templateData.slug}`);
      setCurrentStep('PUBLISH_LIVE');

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during onboarding setup.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-900/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Onboarding Stepper Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800/80">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Time-To-Value (TTV): &lt; 3 Minutes</span>
            <h1 className="text-xl font-black mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Launch Your High-Converting Page</h1>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-semibold">
            <span className={currentStep === 'SIGNUP' ? 'text-indigo-400' : 'text-slate-400'}>1. Account</span>
            <span>➡️</span>
            <span className={currentStep === 'TEMPLATE_SELECT' ? 'text-indigo-400' : 'text-slate-400'}>2. Template</span>
            <span>➡️</span>
            <span className={currentStep === 'AI_CUSTOMIZE' ? 'text-indigo-400' : 'text-slate-400'}>3. AI Customize</span>
            <span>➡️</span>
            <span className={currentStep === 'PUBLISH_LIVE' ? 'text-indigo-400' : 'text-slate-400'}>4. Live Launch</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-6">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: SIGNUP PANEL */}
        {currentStep === 'SIGNUP' && (
          <form onSubmit={handleSignup} className="max-w-md mx-auto space-y-4 py-8">
            <div className="text-center space-y-2 mb-6">
              <span className="text-3xl">🔑</span>
              <h2 className="text-lg font-bold">Create Your Developer Portal</h2>
              <p className="text-xs text-slate-400">Instant registration. No credit card required to start compiling.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="admin@saaslander.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-400">Secret Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              Continue to Templates Library ➡️
            </button>
          </form>
        )}

        {/* STEP 2: TEMPLATE SELECTION PANEL */}
        {currentStep === 'TEMPLATE_SELECT' && (
          <div className="space-y-6">
            <div className="text-center space-y-1 mb-4">
              <span className="text-3xl">🎨</span>
              <h2 className="text-lg font-bold">Select a High-Converting Layout</h2>
              <p className="text-xs text-slate-400">Pre-configured with elite visual spacing, WCAG contrast ratios, and CTA blocks.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(TEMPLATES_REGISTRY).map((template) => (
                <div
                  key={template.templateId}
                  onClick={() => handleSelectTemplate(template)}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.01] group text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{template.category}</span>
                    <span className="text-slate-600 group-hover:text-indigo-400 transition-colors">➕</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">{template.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: AI CUSTOMIZE PANEL */}
        {currentStep === 'AI_CUSTOMIZE' && (
          <form onSubmit={handleAiCustomize} className="max-w-lg mx-auto space-y-5 py-6">
            <div className="text-center space-y-1 mb-4">
              <span className="text-3xl">🤖</span>
              <h2 className="text-lg font-bold">AI Design Adaptation Co-Pilot</h2>
              <p className="text-xs text-slate-400">Describe your product (e.g., "A dark SaaS page in Dubai with urgent discount")</p>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5 text-left">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Selected Base Template</span>
                <span>Active</span>
              </div>
              <p className="text-white font-bold">{selectedTemplate?.name}</p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] uppercase font-bold text-slate-400">AI Adaptation Prompt (Optional)</label>
              <textarea
                rows={3}
                placeholder="Write custom instructions... (Our spelling corrector autocorrects errors automatically!)"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg hover:opacity-95 disabled:opacity-50"
            >
              {isProcessing ? '✨ Compiling AST & Deploying to Edge CDN...' : '🚀 Generate & Publish Page Live ➡️'}
            </button>
          </form>
        )}

        {/* STEP 4: LIVE DEPLOYED SUCCESS PANEL */}
        {currentStep === 'PUBLISH_LIVE' && (
          <div className="text-center py-10 space-y-6 max-w-md mx-auto">
            <div className="relative inline-block">
              <span className="text-5xl animate-bounce block">🎉</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Your Website is Live globally!</h2>
              <p className="text-xs text-slate-400 leading-normal">Compiled from AST, optimized, minified, and deployed directly to global Anycast Edge caching networks.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left font-mono space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Edge Server Serving Header</div>
              <p className="text-emerald-400 break-all select-all">{liveUrl}</p>
              <div className="text-[9px] text-slate-500 mt-2">🚀 Response Speed: <strong>&lt; 10ms (Anycast Edge Pop)</strong></div>
            </div>

            <div className="flex space-x-2">
              <a
                href={liveUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow text-center"
              >
                👀 Visit Live Site
              </a>
              <button
                onClick={() => setCurrentStep('TEMPLATE_SELECT')}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition-all"
              >
                📦 Create Another Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
