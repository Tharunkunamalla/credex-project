"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  TrendingDown, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  Coins, 
  Info, 
  Mail, 
  Building, 
  User, 
  Zap, 
  Sparkles,
  AlertTriangle,
  Calendar,
  ChevronRight
} from "lucide-react";
import { leadFormSchema, LeadFormInput } from "../lib/validations/audit";
import { AuditRecord } from "../lib/db-helper";
import { Recommendation } from "../lib/audit-engine/types";

interface AuditResultsViewProps {
  record: AuditRecord;
}

export default function AuditResultsView({ record }: AuditResultsViewProps) {
  const { inputs, results, summary, id } = record;
  const { recommendations, totalCurrentSpend, totalRecommendedSpend, totalMonthlySavings, totalAnnualSavings, isOptimal, isHighSavings } = results;

  const [copied, setCopied] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // React Hook Form for Lead Capture
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      email: "",
      companyName: "",
      role: "",
      teamSize: inputs?.teamSize || 1,
      auditId: id,
    },
  });

  const handleCopyLink = () => {
    const url = `${window.location.origin}/audit/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onLeadSubmit = async (data: LeadFormInput) => {
    setSubmittingLead(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setLeadSubmitted(true);
      } else {
        setSubmitError(resData.error || "Failed to submit info. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("A connection error occurred. Please try again.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setBookingConfirmed(true);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "downgrade_plan":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "switch_alternative":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "convert_to_credits":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "optimize_seats":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "downgrade_plan":
        return "Downgrade Plan";
      case "switch_alternative":
        return "Switch Alternative";
      case "convert_to_credits":
        return "Convert to Credits";
      case "optimize_seats":
        return "Optimize Seats";
      default:
        return "Keep Plan";
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              StackSpend
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-900 border border-white/10 hover:border-white/20 hover:bg-neutral-800/80 px-3.5 py-2 rounded-lg transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Report</span>
              </>
            )}
          </button>
          
          <Link 
            href="/"
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Audit</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-10">
        
        {/* Dynamic Header Alert Banner based on Optimization level */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-2xl glass-panel border border-white/5 gap-4">
          <div>
            {isOptimal ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Optimal Stack Status</span>
              </div>
            ) : isHighSavings ? (
              <div className="flex items-center gap-2 text-red-400 font-semibold mb-1">
                <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
                <span>High Savings Opportunity Detected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
                <Zap className="w-5 h-5 shrink-0" />
                <span>Moderate Savings Available</span>
              </div>
            )}
            <h2 className="text-lg font-bold">
              {isOptimal 
                ? "Your subscriptions are highly optimized." 
                : `You could be saving $${totalMonthlySavings.toLocaleString()}/mo immediately.`
              }
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Calculations are deterministic based on standard retail rates vs. seat configurations and roles.
            </p>
          </div>
          
          <div>
            <button
              onClick={handleCopyLink}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 bg-neutral-900 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
              {copied ? "Copied Share Link" : "Copy Anonymized Share Link"}
            </button>
          </div>
        </div>

        {/* Hero Savings Presentation */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950/20 p-8 sm:p-10 shadow-2xl shadow-indigo-500/5">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Massive savings circle metrics */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Estimated Overall Savings
              </span>
              <div className="space-y-1">
                <div className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                  ${totalMonthlySavings.toLocaleString()}
                  <span className="text-xl sm:text-2xl font-medium text-neutral-400">/mo</span>
                </div>
                <div className="text-lg font-semibold text-emerald-400 flex items-center justify-center md:justify-start gap-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>Save ${totalAnnualSavings.toLocaleString()}/year</span>
                </div>
              </div>
              
              <div className="flex gap-6 pt-2 text-xs text-neutral-400 border-t border-white/5 w-full justify-center md:justify-start">
                <div>
                  <span className="block text-[10px] uppercase text-neutral-500 mb-0.5">Current Spend</span>
                  <span className="font-semibold text-neutral-300 text-sm">${totalCurrentSpend.toLocaleString()}/mo</span>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <span className="block text-[10px] uppercase text-neutral-500 mb-0.5">Target Spend</span>
                  <span className="font-semibold text-white text-sm">${totalRecommendedSpend.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* AI Executive Summary Paragraph */}
            <div className="md:col-span-7 bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                <Sparkles className="w-3 h-3" />
                <span>AI Insights</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-200 mb-3 flex items-center gap-1.5">
                Executive Audit Summary
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                {summary}
              </p>
            </div>

          </div>
        </div>

        {/* Detailed breakdown breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Subscriptions Breakdown</h3>
            <span className="text-xs text-neutral-400">
              {recommendations.length} {recommendations.length === 1 ? "subscription" : "subscriptions"} audited
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((rec: Recommendation, index: number) => {
              const hasSavings = rec.savings > 0;
              return (
                <div 
                  key={index}
                  className={`glass-panel p-6 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                    hasSavings 
                      ? "border-white/10 hover:border-indigo-500/20" 
                      : "border-white/5 opacity-85"
                  }`}
                >
                  {/* Left accent bar for saving items */}
                  {hasSavings && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Tool details */}
                    <div className="md:col-span-3 space-y-1">
                      <h4 className="text-lg font-bold">{rec.toolName}</h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs bg-neutral-900 border border-white/5 text-neutral-400 px-2 py-0.5 rounded-md">
                          {rec.currentPlan}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {rec.recommendedSeats} {rec.recommendedSeats === 1 ? "seat" : "seats"}
                        </span>
                      </div>
                    </div>

                    {/* Action Recommended */}
                    <div className="md:col-span-3">
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getActionBadgeClass(rec.recommendedAction)}`}>
                        {getActionLabel(rec.recommendedAction)}
                      </span>
                    </div>

                    {/* Spend Comparison */}
                    <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-4">
                      <div>
                        <span className="block text-[10px] text-neutral-500 uppercase">Current</span>
                        <span className="font-semibold text-neutral-300">${rec.currentSpend}/mo</span>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-neutral-600 hidden md:block" />
                      
                      <div>
                        <span className="block text-[10px] text-neutral-500 uppercase">Recommended</span>
                        <span className="font-semibold text-white">
                          {rec.recommendedSpend === 0 ? "—" : `$${rec.recommendedSpend}/mo`}
                        </span>
                      </div>
                    </div>

                    {/* Savings & Detail */}
                    <div className="md:col-span-3 text-right flex md:flex-col items-center justify-between md:justify-center md:items-end">
                      <span className="block text-[10px] text-neutral-500 uppercase md:hidden">Savings</span>
                      {hasSavings ? (
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 block text-base">
                            -${rec.savings}/mo
                          </span>
                          <span className="text-[10px] text-emerald-500/80">
                            Save ${Math.round(rec.savings * 12)}/yr
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500 italic">Fully optimized</span>
                      )}
                    </div>

                  </div>

                  {/* Recommendation details explanation */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                    <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-400 leading-normal">
                      {rec.reason}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic CTAs & Lead Capture Gate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          
          {/* Left Block: Lead Capture Form (Email gate for PDF or custom audit) */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {leadSubmitted ? (
              <div className="my-auto py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Audit Saved Successfully</h3>
                <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  Thank you! We&apos;ve logged your details and sent a transactional PDF recap to your inbox. A Credex discount manager will review your stack opportunities shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Claim Your PDF Report</h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Enter your professional email to sync this report, receive a detailed PDF breakdown, and get automated alerts when AI vendors adjust their pricing plans.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onLeadSubmit)} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                        placeholder="you@company.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        {...register("companyName")}
                        className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                        placeholder="Acme Inc."
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-xs text-red-400 mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  {/* Job Title / Role */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Your Role
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        {...register("role")}
                        className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
                        placeholder="Founder / CTO / Engineering Lead"
                      />
                    </div>
                    {errors.role && (
                      <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-2"
                  >
                    {submittingLead ? "Saving details..." : "Email Me PDF Report"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Block: Dynamic Action (High Savings Calendar vs. Moderate credits explore) */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {isHighSavings ? (
              // Consultation calendar scheduling for High Savings
              bookingConfirmed ? (
                <div className="my-auto py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Calendar className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold">Consultation Booked</h3>
                  <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    Your session on <strong>{selectedSlot}</strong> has been scheduled. A Credex partner will reach out at your email to send a calendar invite and review your custom contract credits.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/20 mb-2">
                      Exclusive Founder Offer
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Book Discount Consultation</h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      With over $500/mo in savings, you qualify for high-tier developer credits. Book a free 15-minute consultation with a Credex partner to buy pre-discounted tokens (up to 25% off direct API/licenses).
                    </p>
                  </div>

                  <form onSubmit={handleBookConsultation} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        Select an Available Slot (Local Time)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Tomorrow, 2:00 PM",
                          "Tomorrow, 4:30 PM",
                          "Friday, 10:00 AM",
                          "Friday, 11:30 AM"
                        ].map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                              selectedSlot === slot
                                ? "bg-indigo-600 border-indigo-500 text-white"
                                : "bg-neutral-900 border-white/5 text-neutral-300 hover:border-white/10"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedSlot}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-md text-sm disabled:opacity-50"
                    >
                      Confirm Booking Slot
                    </button>
                  </form>
                </div>
              )
            ) : (
              // Moderate/Optimal CTA: Claim Credex Credits directly
              <div className="space-y-6 my-auto flex flex-col justify-center h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight">Claim Pre-Discounted Credits</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Credex provides direct API developer tokens and premium seats at wholesale rates for Cursor, Claude, OpenAI, and Gemini. Reduce your monthly run-rate instantly without changing a single line of application code.
                  </p>
                </div>

                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-md text-sm text-center inline-block"
                >
                  Explore Credex Credits (credex.rocks)
                </a>
              </div>
            )}

          </div>

        </div>

      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 bg-neutral-950/20 mt-16">
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
            &copy; {new Date().getFullYear()} StackSpend. Powered by Credex.
          </p>
        </div>
      </footer>
    </div>
  );
}
