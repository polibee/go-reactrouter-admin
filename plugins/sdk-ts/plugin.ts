import type React from "react";

export interface PluginResourceRoutes {
  path?: string;
  listPath?: string;
  createPath?: string;
  editPath?: string;
  viewPath?: string;
}

export interface PluginResourceDefinition {
  name: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  navigation?: {
    group?: string;
    sort?: number;
    badge?: string | number;
    hidden?: boolean;
  };
  permissions?: Record<string, string | undefined>;
  routes?: PluginResourceRoutes;
  data?: Record<string, unknown>;
}

export interface PluginPageDefinition {
  id: string;
  path: string;
  component: React.ComponentType;
  permission?: string;
}

export interface PluginNavigationItem {
  group?: string;
  sort?: number;
  title: string;
  url?: string;
  href?: string;
  to?: string;
  permission?: string;
  badge?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  items?: PluginNavigationItem[];
}

export interface PluginFrontendApp {
  registerResource(resource: PluginResourceDefinition): void;
  registerPage(page: PluginPageDefinition): void;
  registerNavigation(item: PluginNavigationItem): void;
}

export interface PluginFrontendModule {
  register(app: PluginFrontendApp): void;
}
