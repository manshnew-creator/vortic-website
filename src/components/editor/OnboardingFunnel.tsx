'use client'; // ENFORCE CLIENT RUNTIME ON NEXT.JS 15 (RSC Resolution)

import React, { useState, useEffect } from 'react';
import { TEMPLATES_REGISTRY, LandingPageTemplate } from '../../lib/theme/templates';

type OnboardingStep = 'SIGNUP' | 'TEMPLATE_SELECT' | 'AI_CUSTOMIZE' | 'PUBLISH_LIVE';

export const OnboardingFunnel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('SIGNUP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<LandingPageTemplate | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulated live futuristic compiler logs during Edge-native publication
  const MOCK_COMPILER_LOGS = [
    '📡 [0.05s] Parsing semantic user prompt intent...',
    '🪄 [0.45s] Running Levenshtein spelling corrections...',
    '🎨 [0.85s] Adjusting psychological color tokens & theme presets...',
    '✍️ [1.25s] Generating high-intent SEO copywriting & meta tags...',
    '⚙️ [1.65s] Compiling Abstract Syntax Tree (AST) node structures...',
    '⚡ [2.05s] Extracting atomic CSS classes & optimizing layouts...',
    '📦 [2.45s] Minifying final HTML standalone index.html build...',
    '🚀 [2.85s] Replicating compiled stream to 300+ Edge Anycast CDN nodes...'
  ];

  useEffect(() => {
    if (!isProcessing) return;

    setTerminalLogs([]);
    let logIndex = 0;

    const interval = setInterval(() => {
      if (logIndex < MOCK_COMPILER_LOGS.length) {
        setTerminalLogs((prev) => [...prev, MOCK_COMPILER_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all account fields.');
      return;
    }
    setErrorMsg(null);
    setCurrentStep('TEMPLATE_SELECT');
  };

  const handleSelectTemplate = (template: LandingPageTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('AI_CUSTOMIZE');
  };

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
          websiteId: 'website_demo_1',
        }),
      });

      const templateData = await templateResponse.json();
      if (!templateResponse.ok) {
        throw new Error(templateData.error || 'Failed to instantiate template.');
      }

      const pageId = templateData.pageId;

      // B. Adapt Page Schema using the AI-assisted Workflow API
      let finalSchema = templateData.schema;
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
        if (aiResponse.ok) {
          finalSchema = aiData.schema;
        }
      }

      // Simulate a small compile delay for the magical logs to complete beautifully
      await new Promise((resolve) => setTimeout(resolve, 3200));

      // C. Compile and Publish Static HTML directly to the Edge CDN API
      const publishResponse = await fetch('/api/website/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          content: finalSchema,
        }),
      });

      const publishData = await publishResponse.json();
      if (!publishResponse.ok) {
        throw new Error(publishData.error || 'Failed to publish to Edge CDN.');
      }

      setLiveUrl(`https://vortic-ten.vercel.app/_sites/demo/home`);
      setCurrentStep('PUBLISH_LIVE');

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during onboarding setup.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background glowing gradients (Visual Polish) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-indigo-900/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-2xl relative z-10">
        
        {/* Dynamic Stepper Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800/80 gap-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Vext™ Autopilot
            </span>
            <h1 className="text-xl md:text-2xl font-black mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {currentStep === 'SIGNUP' && 'Create Your Vortic Account'}
              {currentStep === 'TEMPLATE_SELECT' && 'Select Conversion Template'}
              {currentStep === 'AI_CUSTOMIZE' && 'AI Design Customizer'}
              {currentStep === 'PUBLISH_LIVE' && 'Your Website is Live Globally!'}
            </h1>
          </div>
          
          {/* Responsive Navigation Dots */}
          <div className="flex items-center space-x-1.5 text-[10px] font-bold font-mono text-slate-500 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-850">
            <span className={currentStep === 'SIGNUP' ? 'text-indigo-400' : 'text-slate-500'}>1. Account</span>
            <span>/</span>
            <span className={currentStep === 'TEMPLATE_SELECT' ? 'text-indigo-400' : 'text-slate-500'}>2. Template</span>
            <span>/</span>
            <span className={currentStep === 'AI_CUSTOMIZE' ? 'text-indigo-400' : 'text-slate-500'}>3. AI Custom</span>
            <span>/</span>
            <span className={currentStep === 'PUBLISH_LIVE' ? 'text-emerald-400' : 'text-slate-500'}>4. Live</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs mb-6 text-left">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* STEP 1: FAST SIGNUP */}
        {currentStep === 'SIGNUP' && (
          <form onSubmit={handleSignup} className="max-w-md mx-auto space-y-5 py-6 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="admin@vortic.website"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Secret Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              Continue to Templates Library ➡️
            </button>
          </form>
        )}

        {/* STEP 2: TEMPLATE SELECTION (Framer-tier visual carousel) */}
        {currentStep === 'TEMPLATE_SELECT' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.values(TEMPLATES_REGISTRY).map((template) => (
                <div
                  key={template.templateId}
                  onClick={() => handleSelectTemplate(template)}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.01] group text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                  <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">{template.category}</span>
                  <h3 className="text-sm font-black text-white mt-3 mb-1.5 group-hover:text-indigo-400 transition-colors">{template.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: AI CUSTOMIZE & DYNAMIC INSTANTIATION (Futuristic Terminal HUD) */}
        {currentStep === 'AI_CUSTOMIZE' && (
          <form onSubmit={handleAiCustomize} className="max-w-xl mx-auto space-y-6 py-4 text-left">
            
            {!isProcessing ? (
              <>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-500">Selected Blueprint</span>
                    <p className="text-xs font-black text-white mt-0.5">{selectedTemplate?.name}</p>
                  </div>
                  <button type="button" onClick={() => setCurrentStep('TEMPLATE_SELECT')} className="text-[10px] font-bold text-indigo-400 hover:underline">Change</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">AI Adaptor Instruction Prompt</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 'A dark SaaS landing page in Dubai with 50% discount' (our spellchecker will autocorrect spelling mistakes automatically!)"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg hover:opacity-95"
                >
                  🚀 Compile & Launch Site Live
                </button>
              </>
            ) : (
              // Futuristic Live Compiler Terminal HUD (Magical TTV UX!)
              <div className="space-y-4">
                <div className="bg-black/80 border border-slate-800 p-6 rounded-2xl font-mono text-xs text-left space-y-2.5 h-64 overflow-y-auto scrollbar-thin shadow-inner relative">
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                    <span className="text-[9px] text-indigo-400 uppercase font-bold">Vext™ Compiler Active</span>
                  </div>
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="animate-fade-in text-indigo-300">
                      {log}
                    </div>
                  ))}
                  {terminalLogs.length < MOCK_COMPILER_LOGS.length && (
                    <div className="text-slate-600 animate-pulse">Running compilation pass...</div>
                  )}
                </div>
                <div className="text-center text-xs text-slate-500 animate-pulse">
                  Assembling Abstract Syntax Tree, extracting CSS classes and deploying standalone HTML...
                </div>
              </div>
            )}
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
              <h2 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Your Website is Live globally!</h2>
              <p className="text-xs text-slate-400 leading-normal">Compiled from AST, optimized, minified, and deployed directly to global Anycast Edge caching networks.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-left font-mono space-y-1">
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
