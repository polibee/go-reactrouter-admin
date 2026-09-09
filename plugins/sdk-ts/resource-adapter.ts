import { pluginRequest, type PluginRequestOptions } from "./client-runtime.js";

export interface PluginResourceListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  filter?: Record<string, string>;
}

export interface PluginResourceListResult<T> {
  items: T[];
  total?: number;
}

export interface PluginResourceDataProvider<T> {
  list?: (
    query?: PluginResourceListQuery,
  ) => Promise<PluginResourceListResult<T>>;
  find?: (id: string) => Promise<T | null>;
  create?: (values: Record<string, unknown>) => Promise<T>;
  update?: (id: string, values: Record<string, unknown>) => Promise<T>;
  delete?: (id: string) => Promise<boolean | void>;
}

function queryOptions(
  query?: PluginResourceListQuery,
): PluginRequestOptions | undefined {
  if (!query) return undefined;
  const { filter, ...rest } = query;
  return {
    query: {
      ...rest,
      ...Object.fromEntries(
        Object.entries(filter ?? {}).map(([key, value]) => [
          `filter[${key}]`,
          value,
        ]),
      ),
    },
  };
}

export function createPluginResourceProvider<T>(
  pluginId: string,
  path: string,
): PluginResourceDataProvider<T> {
  return {
    async list(query) {
      const response = await pluginRequest<T[]>(
        pluginId,
        "GET",
        path,
        undefined,
        queryOptions(query),
      );
      const total = response.meta?.total;
      return {
        items: response.data,
        total: typeof total === "number" ? total : undefined,
      };
    },
    async find(id) {
      const response = await pluginRequest<T>(pluginId, "GET", `${path}/${id}`);
      return response.data;
    },
    async create(values) {
      const response = await pluginRequest<T>(pluginId, "POST", path, values);
      return response.data;
    },
    async update(id, values) {
      const response = await pluginRequest<T>(
        pluginId,
        "PUT",
        `${path}/${id}`,
        values,
      );
      return response.data;
    },
    async delete(id) {
      await pluginRequest<null>(pluginId, "DELETE", `${path}/${id}`);
      return true;
    },
  };
}
