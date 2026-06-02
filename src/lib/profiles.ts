"use client";
// Local, no-login profiles. A registry of named profiles lives in localStorage;
// each profile's study data lives under its own key (see store.ts). Switching a
// profile repoints the data store and rehydrates it. No passwords, no backend.
import { create } from "zustand";
import { useStore, PROFILE_ACTIVE_KEY } from "./store";

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

const REG_KEY = "recall-profiles";
const OLD_DATA_KEY = "recall-store-v3"; // pre-profiles data (migrate once)

export const EMOJIS = ["🦊", "🐼", "🦉", "🐙", "🐝", "🦄", "🐢", "🐳", "🦁", "🐧", "🌸", "⚡", "🔥", "🎯", "🚀", "🧠"];

function uid() {
  const r = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return r.slice(0, 8);
}
function loadReg(): Profile[] {
  try {
    return JSON.parse(localStorage.getItem(REG_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveReg(p: Profile[]) {
  localStorage.setItem(REG_KEY, JSON.stringify(p));
}
const dataKey = (id: string) => `recall-data::${id}`;

/** Point the data store at a profile's storage and load it (seed if empty). */
function activate(id: string) {
  localStorage.setItem(PROFILE_ACTIVE_KEY, id);
  if (localStorage.getItem(dataKey(id))) {
    void useStore.persist.rehydrate();
  } else {
    useStore.getState().resetToSeed(); // fresh deck, zero progress — persists to the new key
  }
}

interface ProfileState {
  profiles: Profile[];
  activeId: string | null;
  ready: boolean;
  init: () => void;
  create: (name: string, emoji: string) => void;
  switchTo: (id: string) => void;
  rename: (id: string, name: string, emoji: string) => void;
  remove: (id: string) => void;
}

export const useProfiles = create<ProfileState>((set, get) => ({
  profiles: [],
  activeId: null,
  ready: false,

  init: () => {
    if (get().ready || typeof window === "undefined") return;
    let reg = loadReg();

    if (reg.length === 0) {
      // First run: create a default profile, migrating any pre-profile data.
      const id = uid();
      const p: Profile = { id, name: "You", emoji: "🦊", createdAt: new Date().toISOString() };
      reg = [p];
      saveReg(reg);
      localStorage.setItem(PROFILE_ACTIVE_KEY, id);
      const old = localStorage.getItem(OLD_DATA_KEY);
      if (old && !localStorage.getItem(dataKey(id))) localStorage.setItem(dataKey(id), old);
      if (localStorage.getItem(dataKey(id))) void useStore.persist.rehydrate();
      else useStore.getState().resetToSeed();
      set({ profiles: reg, activeId: id, ready: true });
      return;
    }

    let activeId = localStorage.getItem(PROFILE_ACTIVE_KEY);
    if (!activeId || !reg.find((p) => p.id === activeId)) {
      activeId = reg[0].id;
      localStorage.setItem(PROFILE_ACTIVE_KEY, activeId);
    }
    activate(activeId);
    set({ profiles: reg, activeId, ready: true });
  },

  create: (name, emoji) => {
    const id = uid();
    const p: Profile = { id, name: name.trim() || "New profile", emoji: emoji || "🧠", createdAt: new Date().toISOString() };
    const reg = [...get().profiles, p];
    saveReg(reg);
    activate(id);
    set({ profiles: reg, activeId: id });
  },

  switchTo: (id) => {
    if (id === get().activeId) return;
    activate(id);
    set({ activeId: id });
  },

  rename: (id, name, emoji) => {
    const reg = get().profiles.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name, emoji: emoji || p.emoji } : p));
    saveReg(reg);
    set({ profiles: reg });
  },

  remove: (id) => {
    let reg = get().profiles.filter((p) => p.id !== id);
    localStorage.removeItem(dataKey(id));
    let activeId = get().activeId;
    if (activeId === id) {
      if (reg.length) {
        activeId = reg[0].id;
        activate(activeId);
      } else {
        const nid = uid();
        const np: Profile = { id: nid, name: "You", emoji: "🦊", createdAt: new Date().toISOString() };
        reg = [np];
        activate(nid);
        activeId = nid;
      }
    }
    saveReg(reg);
    set({ profiles: reg, activeId });
  },
}));
