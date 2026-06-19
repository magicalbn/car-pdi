import { create } from "zustand";

export type FilterKey =
  | "all"
  | "pending"
  | "passed"
  | "failed"
  | "critical"
  | "major"
  | "minor"
  | "has-photos"
  | "missing-notes";

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "passed", label: "Passed" },
  { key: "failed", label: "Failed" },
  { key: "critical", label: "Critical" },
  { key: "major", label: "Major" },
  { key: "minor", label: "Minor" },
  { key: "has-photos", label: "Has Photos" },
  { key: "missing-notes", label: "Missing Notes" },
];

interface UIState {
  search: string;
  filter: FilterKey;
  setSearch: (s: string) => void;
  setFilter: (f: FilterKey) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  search: "",
  filter: "all",
  setSearch: (search) => set({ search }),
  setFilter: (filter) => set({ filter }),
  reset: () => set({ search: "", filter: "all" }),
}));
