import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ToolInput, UseCase } from "../audit-engine/types";

interface FormState {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
  addTool: (tool: ToolInput) => void;
  updateTool: (index: number, updatedTool: Partial<ToolInput>) => void;
  removeTool: (index: number) => void;
  setTeamSize: (size: number) => void;
  setUseCase: (useCase: UseCase) => void;
  resetForm: () => void;
}

const initialTools: ToolInput[] = [];

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      tools: initialTools,
      teamSize: 1,
      useCase: "mixed",
      addTool: (tool) => set((state) => ({ tools: [...state.tools, tool] })),
      updateTool: (index, updatedTool) =>
        set((state) => {
          const newTools = [...state.tools];
          newTools[index] = { ...newTools[index], ...updatedTool };
          return { tools: newTools };
        }),
      removeTool: (index) =>
        set((state) => ({
          tools: state.tools.filter((_, i) => i !== index),
        })),
      setTeamSize: (size) => set({ teamSize: size }),
      setUseCase: (useCase) => set({ useCase }),
      resetForm: () => set({ tools: [], teamSize: 1, useCase: "mixed" }),
    }),
    {
      name: "stackspend-form-store", // LocalStorage key
    }
  )
);
