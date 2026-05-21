"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  TrendingUp,
  Settings,
  Brain,
  Info
} from "lucide-react";
import { auditFormSchema, AuditFormInput } from "../../lib/validations/audit";
import { useFormStore } from "../../lib/store/form-store";
import { UseCase } from "../../lib/audit-engine/types";
import pricingData from "../../data/pricing.json";

// Type definition for local pricing mapping
interface PlanDetails {
  name: string;
  pricePerSeat: number;
  minSeats: number;
  isFlatRate: boolean;
}

interface ToolDetails {
  name: string;
  plans: Record<string, PlanDetails>;
}

const pricing: Record<string, ToolDetails> = pricingData.tools;

export default function SpendForm() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zustand Store
  const storeTools = useFormStore((state) => state.tools);
  const storeTeamSize = useFormStore((state) => state.teamSize);
  const storeUseCase = useFormStore((state) => state.useCase);
  const addStoreTool = useFormStore((state) => state.addTool);
  const setStoreTeamSize = useFormStore((state) => state.setTeamSize);
  const setStoreUseCase = useFormStore((state) => state.setUseCase);
  const updateStoreTool = useFormStore((state) => state.updateTool);
  const removeStoreTool = useFormStore((state) => state.removeTool);

  // SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // React Hook Form
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AuditFormInput>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      tools: storeTools.length > 0 ? storeTools : [{ toolId: "cursor", planId: "pro", seats: 1, monthlySpend: 20 }],
      teamSize: storeTeamSize,
      useCase: storeUseCase,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tools",
  });

  const watchedTools = watch("tools");
  const watchedTeamSize = watch("teamSize");
  const watchedUseCase = watch("useCase");

  // Keep Zustand store in sync with form state changes
  useEffect(() => {
    if (!mounted) return;
    setStoreTeamSize(watchedTeamSize);
  }, [watchedTeamSize, setStoreTeamSize, mounted]);

  useEffect(() => {
    if (!mounted) return;
    setStoreUseCase(watchedUseCase as UseCase);
  }, [watchedUseCase, setStoreUseCase, mounted]);

  useEffect(() => {
    if (!mounted) return;
    // Debounce state saving slightly to avoid heavy state writes
    const handler = setTimeout(() => {
      // Sync list of tools to Zustand
      useFormStore.setState({ tools: watchedTools });
    }, 200);
    return () => clearTimeout(handler);
  }, [watchedTools, mounted]);

  // Handle auto-calculating spend suggestions based on seats and plans selection
  const handleToolOrPlanChange = (index: number, field: "toolId" | "planId" | "seats", val: string | number) => {
    const currentTools = [...watchedTools];
    const tool = field === "toolId" ? (val as string) : currentTools[index].toolId;
    const plan = field === "planId" ? (val as string) : currentTools[index].planId;
    const seats = field === "seats" ? Number(val) : currentTools[index].seats;

    const toolConfig = pricing[tool];
    if (toolConfig) {
      // If plan changed or tool changed, check if plan is valid for the new tool. If not, pick first plan.
      let planKey = plan;
      if (!toolConfig.plans[plan]) {
        planKey = Object.keys(toolConfig.plans)[0];
        setValue(`tools.${index}.planId`, planKey);
      }

      const planConfig = toolConfig.plans[planKey];
      if (planConfig) {
        // Enforce minimum seats if needed
        if (field === "planId" && seats < planConfig.minSeats) {
          setValue(`tools.${index}.seats`, planConfig.minSeats);
          setValue(`tools.${index}.monthlySpend`, planConfig.pricePerSeat * planConfig.minSeats);
        } else {
          setValue(`tools.${index}.monthlySpend`, planConfig.isFlatRate ? 0 : planConfig.pricePerSeat * seats);
        }
      }
    }
  };

  const onSubmit = async (data: AuditFormInput) => {
    setIsSubmitting(true);
    // Simulate submission / API delay for Day 2 loading states
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Form submitted successfully! Audit engine logic calculations will process on Day 3.");
    }, 1500);
  };

  if (!mounted) {
    // Premium Skeleton Loader
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse space-y-8">
        <div className="h-44 bg-neutral-900/50 rounded-2xl border border-white/5" />
        <div className="h-72 bg-neutral-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Fields Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Team Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Team Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center justify-between">
                  Team Size
                  <span className="text-xs text-neutral-500">Total members</span>
                </label>
                <input
                  type="number"
                  {...register("teamSize", { valueAsNumber: true })}
                  className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  placeholder="e.g. 5"
                />
                {errors.teamSize && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.teamSize.message}
                  </p>
                )}
              </div>

              {/* Primary Use Case */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center justify-between">
                  Primary Use Case
                  <span className="text-xs text-neutral-500">Core workflow</span>
                </label>
                <select
                  {...register("useCase")}
                  className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all cursor-pointer"
                >
                  <option value="mixed">Mixed Usage</option>
                  <option value="coding">Software Engineering (Coding)</option>
                  <option value="writing">Content Creation / Copywriting</option>
                  <option value="data">Data Analysis & Modeling</option>
                  <option value="research">Academic / Market Research</option>
                </select>
                {errors.useCase && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.useCase.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">AI Tools Subscriptions</h2>
              </div>
              <button
                type="button"
                onClick={() => append({ toolId: "cursor", planId: "pro", seats: 1, monthlySpend: 20 })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tool
              </button>
            </div>

            {errors.tools && !Array.isArray(errors.tools) && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.tools.message}
              </div>
            )}

            {/* Dynamic cards list */}
            <div className="space-y-4">
              {fields.map((field, index) => {
                const selectedToolId = watchedTools[index]?.toolId || "cursor";
                const toolConfig = pricing[selectedToolId];
                const plans = toolConfig ? Object.keys(toolConfig.plans) : [];

                return (
                  <div 
                    key={field.id}
                    className="relative glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200 group"
                  >
                    {/* Delete button top right */}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 p-1.5 hover:bg-neutral-900 rounded-lg transition-all"
                        title="Remove tool"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pr-2 sm:pr-8">
                      {/* Tool Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400">Tool</label>
                        <select
                          {...register(`tools.${index}.toolId` as const)}
                          onChange={(e) => handleToolOrPlanChange(index, "toolId", e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all cursor-pointer"
                        >
                          {Object.keys(pricing).map((key) => (
                            <option key={key} value={key}>
                              {pricing[key].name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Plan Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400">Plan</label>
                        <select
                          {...register(`tools.${index}.planId` as const)}
                          onChange={(e) => handleToolOrPlanChange(index, "planId", e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all cursor-pointer capitalize"
                        >
                          {plans.map((planKey) => (
                            <option key={planKey} value={planKey}>
                              {pricing[selectedToolId]?.plans[planKey]?.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Seats */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
                          Seats
                        </label>
                        <input
                          type="number"
                          {...register(`tools.${index}.seats` as const, { valueAsNumber: true })}
                          onChange={(e) => handleToolOrPlanChange(index, "seats", Number(e.target.value))}
                          className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all"
                          min={1}
                        />
                      </div>

                      {/* Spend */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                          Spend ($)
                          <span className="text-[10px] text-neutral-500">(monthly)</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register(`tools.${index}.monthlySpend` as const, { valueAsNumber: true })}
                          className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Auto calculations helper indicator */}
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-500">
                      <Info className="w-3 h-3 text-neutral-500/80" />
                      <span>Prefills based on standard retail pricing. Adjust manually if you pay custom discounts.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audit Details Summary Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:sticky lg:top-8">
            <h3 className="text-lg font-bold">Audit Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-neutral-400">Total Tools</span>
                <span className="font-semibold">{watchedTools.length}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-neutral-400">Total Seats</span>
                <span className="font-semibold">
                  {watchedTools.reduce((acc, tool) => acc + (Number(tool.seats) || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-neutral-400">Entered Monthly Spend</span>
                <span className="font-bold text-indigo-400">
                  ${watchedTools.reduce((acc, tool) => acc + (Number(tool.monthlySpend) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Run Audit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Generating Audit...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  Run AI Spend Audit
                </>
              )}
            </button>
            
            <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl text-[11px] text-neutral-500 leading-normal flex gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>We audit redundant licenses, plan size fits, and retail API spreads to find up to 30% savings.</span>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
