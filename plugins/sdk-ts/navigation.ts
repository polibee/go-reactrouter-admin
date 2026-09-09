import type { PluginNavigationItem } from "./plugin.js";

export function pluginNavigation(
  group: string,
  item: Omit<PluginNavigationItem, "group">,
): PluginNavigationItem {
  return { ...item, group };
}
