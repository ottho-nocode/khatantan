import { supabase } from "@/lib/supabase";
import type {
  DataQuery,
  DataResponse,
  Filter,
  BaseFilter,
  LogicalFilter,
  IncludeOptions,
  NestedIncludeOptions,
  isLogicalFilter as isLogicalFilterFn,
} from "@/types/data";
import { isLogicalFilter } from "@/types/data";

class SupabaseDatabase {
  /**
   * Query multiple rows from a table with filters, sorting, pagination, and includes.
   */
  async getTable(
    { from, where, include, offset, limit, orderBy }: DataQuery,
    signal?: AbortSignal
  ): Promise<DataResponse> {
    const selectStr = this.buildSelectString(include);
    let query = supabase.from(from).select(selectStr, { count: "exact" });

    if (where) {
      query = this.applyFilter(query, where);
    }

    if (orderBy) {
      for (const order of orderBy) {
        query = query.order(order.field, {
          ascending: order.direction === "asc",
        });
      }
    }

    if (limit !== undefined) {
      const start = offset ?? 0;
      query = query.range(start, start + limit - 1);
    }

    if (signal) {
      query = query.abortSignal(signal);
    }

    const { data, error, count } = await query;
    if (error) throw error.message;

    return {
      data: data ?? [],
      meta: {
        total: count ?? 0,
        page: limit ? Math.floor((offset ?? 0) / limit) + 1 : 1,
        pageSize: limit,
        hasNext: limit ? (offset ?? 0) + limit < (count ?? 0) : false,
        hasPrev: (offset ?? 0) > 0,
      },
    };
  }

  /**
   * Fetch a single row by field value.
   */
  async getRow(
    {
      table,
      value,
      field = "id",
      include,
    }: {
      table: string;
      value: string;
      field?: string;
      include?: IncludeOptions;
    },
    signal?: AbortSignal
  ) {
    const selectStr = this.buildSelectString(include);
    let query = supabase.from(table).select(selectStr).eq(field, value).single();

    if (signal) {
      query = query.abortSignal(signal);
    }

    const { data, error } = await query;
    if (error) throw error.message;
    return data;
  }

  /**
   * Create a row in a table.
   */
  async createRow({ table, data }: { table: string; data: Record<string, any> }) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    if (error) throw error.message;
    return result;
  }

  /**
   * Update a row by ID.
   */
  async updateRow({
    table,
    id,
    data,
  }: {
    table: string;
    id: string;
    data: Record<string, any>;
  }) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error.message;
    return result;
  }

  /**
   * Delete a row by ID.
   */
  async deleteRow({ table, id }: { table: string; id: string }) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error.message;
    return { success: true };
  }

  /**
   * Aggregate query (count, sum, avg, etc.) via Supabase RPC or direct count.
   */
  async getTableAgg(
    {
      table,
      filters = null,
      limit = null,
    }: { table: string; filters?: any; limit?: number | null },
    signal?: AbortSignal
  ) {
    let query = supabase.from(table).select("*", { count: "exact", head: true });

    if (filters) {
      query = this.applyFilter(query, filters);
    }

    if (signal) {
      query = query.abortSignal(signal);
    }

    const { count, error } = await query;
    if (error) throw error.message;
    return { _count: count ?? 0 };
  }

  // ---- Private helpers ----

  /**
   * Build a PostgREST select string from IncludeOptions.
   * e.g. { modules: { include: { lessons: true } } } → "*, modules(*, lessons(*))"
   */
  private buildSelectString(include?: IncludeOptions): string {
    if (!include) return "*";

    const parts: string[] = ["*"];

    for (const [key, value] of Object.entries(include)) {
      if (key === "_agg") continue; // Aggregates handled separately

      if (value === true) {
        parts.push(`${key}(*)`);
      } else if (typeof value === "object" && value !== null) {
        const nested = value as NestedIncludeOptions;
        const nestedSelect = nested.include
          ? this.buildSelectString(nested.include)
          : "*";
        parts.push(`${key}(${nestedSelect})`);
      }
    }

    return parts.join(", ");
  }

  /**
   * Recursively apply filters to a Supabase query builder.
   */
  private applyFilter(query: any, filter: Filter): any {
    if (isLogicalFilter(filter)) {
      return this.applyLogicalFilter(query, filter as LogicalFilter);
    }
    return this.applyBaseFilter(query, filter as BaseFilter);
  }

  private applyBaseFilter(query: any, filter: BaseFilter): any {
    const { field, operator, value } = filter;

    switch (operator) {
      case "eq":
        return query.eq(field, value);
      case "ne":
        return query.neq(field, value);
      case "gt":
        return query.gt(field, value);
      case "gte":
        return query.gte(field, value);
      case "lt":
        return query.lt(field, value);
      case "lte":
        return query.lte(field, value);
      case "in":
        return query.in(field, value);
      case "nin":
        // PostgREST doesn't have a direct "not in", use .not().in()
        return query.not(field, "in", `(${value.join(",")})`);
      case "like":
        return query.like(field, `%${value}%`);
      case "ilike":
        return query.ilike(field, `%${value}%`);
      case "is_null":
        return query.is(field, null);
      case "not_null":
        return query.not(field, "is", null);
      case "starts_with":
        return query.ilike(field, `${value}%`);
      case "ends_with":
        return query.ilike(field, `%${value}`);
      default:
        return query;
    }
  }

  private applyLogicalFilter(query: any, filter: LogicalFilter): any {
    if (filter.operator === "or") {
      // Build an OR filter string for PostgREST
      const orParts = filter.conditions.map((cond) => {
        if (isLogicalFilter(cond)) {
          // Nested logical filters - flatten if possible
          return this.buildFilterString(cond);
        }
        return this.buildFilterString(cond);
      });
      return query.or(orParts.join(","));
    }

    // AND: apply each condition sequentially (default PostgREST behavior)
    let q = query;
    for (const cond of filter.conditions) {
      q = this.applyFilter(q, cond);
    }
    return q;
  }

  /**
   * Build a PostgREST filter string for use in .or() calls.
   */
  private buildFilterString(filter: Filter): string {
    if (isLogicalFilter(filter)) {
      const logical = filter as LogicalFilter;
      const parts = logical.conditions.map((c) => this.buildFilterString(c));
      if (logical.operator === "and") {
        return `and(${parts.join(",")})`;
      }
      return `or(${parts.join(",")})`;
    }

    const base = filter as BaseFilter;
    const { field, operator, value } = base;

    switch (operator) {
      case "eq":
        return `${field}.eq.${value}`;
      case "ne":
        return `${field}.neq.${value}`;
      case "gt":
        return `${field}.gt.${value}`;
      case "gte":
        return `${field}.gte.${value}`;
      case "lt":
        return `${field}.lt.${value}`;
      case "lte":
        return `${field}.lte.${value}`;
      case "in":
        return `${field}.in.(${value.join(",")})`;
      case "nin":
        return `${field}.not.in.(${value.join(",")})`;
      case "like":
        return `${field}.like.%${value}%`;
      case "ilike":
        return `${field}.ilike.%${value}%`;
      case "is_null":
        return `${field}.is.null`;
      case "not_null":
        return `${field}.not.is.null`;
      case "starts_with":
        return `${field}.ilike.${value}%`;
      case "ends_with":
        return `${field}.ilike.%${value}`;
      default:
        return `${field}.eq.${value}`;
    }
  }
}

export default new SupabaseDatabase();
