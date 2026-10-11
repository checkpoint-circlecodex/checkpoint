import Quests from "./Quests.svelte";
import Quest from "./Quest.svelte";
import type { ViewEntry } from "#core/ui/registry.ts";

export const quests: ViewEntry = {
  id: "quests",
  label: "Les Quêtes",
  href: "#/quetes",
  gl: "❖",
  narrow: "adapt",
  depth: 1,
  view: Quests,
};

export const quest: ViewEntry = {
  id: "quest",
  label: "Quête",
  href: "#/quete/",
  gl: "❖",
  narrow: "stack",
  depth: 2,
  view: Quest,
};
