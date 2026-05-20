"use client";

import React from "react";
import Link from "next/link";
import { 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight, 
  Coins, 
  Layers, 
  CheckCircle,
  Zap,
  Users,
  Percent,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            StackSpend
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-sm text-neutral-400 hidden sm:inline-block">
            Powered by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium">Credex</a>
          </span>
          <Link 
            href="#audit"
            className="text-sm font-semibold bg-neutral-900 border border-white/10 hover:border-white/20 hover:bg-neutral-800/80 px-4 py-2 rounded-lg transition-all"
          >
            Launch Audit
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-white/10 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-purple-300 tracking-wide uppercase">
            Free 2-Minute Audit
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Uncover hidden overspend on <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
            your team's AI tools
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Startups waste thousands monthly on misconfigured AI licenses, redundant developer tools, and retail API markups. Get a clear, defensible audit of your spend in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#audit"
            className="w-full sm:w-auto glow-btn inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20"
          >
            Audit Your Stack
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl text-base font-semibold text-neutral-300 transition-all hover:bg-neutral-800/60"
          >
            How it works
          </a>
        </div>

        {/* Small Trust Snippet */}
        <p className="text-xs text-neutral-500 mt-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500/80" />
          No login required. Anonymized reports. Secure lead capturing.
        </p>
      </section>

      {/* Trust & Brand Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-b border-white/5 bg-neutral-950/30">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-6">
          Auditing popular developer and productivity stacks
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
          <span className="text-lg font-bold">Cursor</span>
          <span className="text-lg font-bold">GitHub Copilot</span>
          <span className="text-lg font-bold">ChatGPT</span>
          <span className="text-lg font-bold">Claude AI</span>
          <span className="text-lg font-bold">OpenAI API</span>
          <span className="text-lg font-bold">Gemini</span>
          <span className="text-lg font-bold">Windsurf</span>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Stop paying retail for AI power
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-base">
            StackSpend runs deterministic, audit-defensible calculations to map your teams to the right plans, saving you up to 40% on standard subscription prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl relative group hover:border-indigo-500/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Seat Optimization</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Verify your seat allocations. We identify empty or single-user licenses stuck on expensive enterprise or team plans and show you where to consolidate.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl relative group hover:border-purple-500/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Vendor Downgrades</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Assess model capabilities versus actual tasks. We recommend switching to cheaper plans or equivalent open source alternatives based on team roles.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl relative group hover:border-blue-500/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Percent className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Credit Savings</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Are you paying card fees and markups on API usage? We highlight real discount paths using direct AI credits sourced via Credex partners.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            How StackSpend Works
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-base">
            A quick 3-step audit designed to map out savings without compromising team velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connector line for large screens */}
          <div className="hidden lg:block absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-lg mb-6 shadow-md">
              1
            </div>
            <h3 className="text-lg font-bold mb-2">Input AI Spend</h3>
            <p className="text-sm text-neutral-400 max-w-xs">
              List the tools your team uses (Cursor, Copilot, ChatGPT, etc.), their plans, user counts, and current spend.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-lg mb-6 shadow-md">
              2
            </div>
            <h3 className="text-lg font-bold mb-2">Engine Analysis</h3>
            <p className="text-sm text-neutral-400 max-w-xs">
              Our audit engine checks for license mismatches, redundant tools, and retail pricing markups against official rates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-lg mb-6 shadow-md">
              3
            </div>
            <h3 className="text-lg font-bold mb-2">Get Actionable Audit</h3>
            <p className="text-sm text-neutral-400 max-w-xs">
              Review a detailed savings report with concrete swap recommendations, complete with a personalized AI-generated summary.
            </p>
          </div>
        </div>
      </section>

      {/* Target Form Placeholder Section (Audit Section) */}
      <section id="audit" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-white/5 text-center">
        <div className="glass-panel p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Ready to Audit Your Stack?</h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8">
            Click below to start our quick spend calculator. The interactive form is currently being built for Day 2.
          </p>
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-8">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">
              Form module releasing in next commit
            </span>
          </div>

          <div>
            <button 
              onClick={() => alert("The spend input form is being wired in our next step. Stay tuned!")}
              className="px-8 py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold transition-all inline-flex items-center gap-2 shadow-lg"
            >
              Start Audit Session
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-neutral-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              StackSpend
            </span>
          </div>
          
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} StackSpend. Built for the Credex Intern Challenge.
          </p>
        </div>
      </footer>
    </div>
  );
}
