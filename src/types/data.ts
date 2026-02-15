// Core filter operators
export type FilterOperator =
  | "eq" // equals
  | "ne" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "in" // in array
  | "nin" // not in array
  | "like" // string contains
  | "ilike" // case insensitive string contains
  | "is_null" // is null
  | "not_null" // is not null
  | "starts_with" // string starts with
  | "ends_with"; // string ends with

// Base filter condition for a single field
export interface BaseFilter {
  field: string;
  operator: FilterOperator;
  value?: any; // Optional because operators like is_null don't need a value
}

// Logical operators for combining filters
export type LogicalOperator = "and" | "or";

// Recursive filter structure for complex queries
export interface LogicalFilter {
  operator: LogicalOperator;
  conditions: (BaseFilter | LogicalFilter)[];
}

// Union type for all possible filter structures
export type Filter = BaseFilter | LogicalFilter;

// Helper type to check if a filter is a logical filter
export const isLogicalFilter = (filter: Filter): filter is LogicalFilter => {
  return "operator" in filter && ["and", "or"].includes(filter.operator);
};

// Include options - either relations or aggregates
export interface IncludeOptions {
  // Regular relation includes - key must be a valid relationship/column name
  [key: string]: boolean | NestedIncludeOptions;

  // Aggregates from relationships
  // Key is a custom alias, value must include 'from' to specify the target table
  _agg?: Record<string, AggregateQuery> | undefined;
}

// Nested include options for relationship queries
export interface NestedIncludeOptions {
  where?: Filter;
  orderBy?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;
  limit?: number;
  include?: IncludeOptions;
}

// Main query interface (removed aggregate key)
export interface DataQuery<T = any> {
  // Table/resource to query
  from: string;

  // Filters to apply
  where?: Filter;

  // Relations to include (now supports aggregates at top level)
  include?: IncludeOptions;

  // Sorting
  orderBy?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;

  // Pagination
  limit?: number;
  offset?: number;
}

// Separate query type for pure aggregations
export interface AggregateQuery {
  // Table/resource to query
  from: string;

  // Filters to apply
  where?: Filter;

  // Aggregations to perform
  _count?: boolean;

  _sum?: Record<string, boolean>;
  _avg?: Record<string, boolean>;
  _min?: Record<string, boolean>;
  _max?: Record<string, boolean>;
}

// Response structure for aggregates
export interface AggregateResponse {
  _count?: number;
  _sum?: Record<string, number | null>;
  _avg?: Record<string, number | null>;
  _min?: Record<string, any>;
  _max?: Record<string, any>;
}

// Response structure
export interface DataResponse<T = any> {
  data: T[];
  meta: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
