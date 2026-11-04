/**
 * CerdikGo TypeScript foundation.
 *
 * These contracts are compile-time only. They do not change Worker runtime
 * behavior, enable agent execution, or grant permissions.
 */

export type EnvironmentName = "development" | "preview" | "production";

export type AgentId =
  | "ATLAS-01"
  | "ATLAS-02"
  | "ATLAS-03"
  | "ATLAS-04"
  | "ATLAS-05"
  | "ATLAS-06"
  | "ATLAS-07"
  | "ATLAS-08"
  | "ATLAS-09";

export type AgentExecutionMode = "plan_only" | "controlled_execution";

export type ActionClass = "read_only" | "controlled_action";

export interface AiBinding {
  run(
    model: string,
    inputs: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<unknown>;
}

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: Record<string, unknown> }>;
}

export interface D1DatabaseBinding {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
}

export interface CerdikGoEnv {
  AI?: AiBinding;
  DB?: D1DatabaseBinding;
  CHAT_RATE_LIMITER?: RateLimitBinding;
  ASSETS?: FetcherBinding;
  CERDIKGO_WORKERS_AI_MODEL?: string;
  ENVIRONMENT?: EnvironmentName | string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_AUTH_REQUIRED?: string;
}

export interface FetcherBinding {
  fetch(request: Request): Promise<Response>;
}

export interface AgentCapability {
  readonly id: AgentId;
  readonly name: string;
  readonly purpose: string;
  readonly tools: readonly string[];
  readonly permission: "read_only";
  readonly execution: "not_enabled";
}

export interface AgentPlanRequest {
  intent: string;
  agents?: AgentId[];
  action_class?: ActionClass;
}

export interface AgentPlan {
  request_id: string;
  status: "planned" | "awaiting_human_approval";
  intent: string;
  coordinator: "Optimus Prime";
  execution_mode: "plan_only";
  selected_agents: AgentId[];
  action_class: ActionClass;
  permission: "read_only";
  tools_invoked: [];
  external_calls_made: false;
  database_writes: false;
  approval_required: boolean;
  approval_binding: string | null;
  note: string;
}

export interface ModelRoute {
  provider: "workers_ai" | "unavailable";
  model: string | null;
  policy: "free_only";
  fallback?: false;
  reason?: "WORKERS_AI_BINDING_MISSING";
}

/**
 * Security invariant: a plan is descriptive data, not an executable grant.
 * Any future executor must independently validate actor, scope, exact payload,
 * approval, and audit record before performing a controlled action.
 */
export interface GovernanceDecision {
  allowed: boolean;
  requiresHumanApproval: boolean;
  actionClass: ActionClass;
  reason:
    | "READ_ONLY_ALLOWED"
    | "HUMAN_APPROVAL_REQUIRED"
    | "DENIED";
}
