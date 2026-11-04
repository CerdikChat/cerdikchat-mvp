export const TASK_SCHEMA = "cerdikgo.task.v1";
export const MAX_INTENT_LENGTH = 4000;
export const ALLOWED_AGENTS = Object.freeze(["ATLAS-01","ATLAS-02","ATLAS-03","ATLAS-04","ATLAS-05","ATLAS-06","ATLAS-07","ATLAS-08","ATLAS-09"]);
const TASK_KEYS = new Set(["task_id","created_at","source","intent","agents","action_class"]);

export function validateTaskEnvelope(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok:false, error:"ROOT_MUST_BE_OBJECT" };
  if (value.schema !== TASK_SCHEMA) return { ok:false, error:"UNSUPPORTED_SCHEMA" };
  if (!value.task || typeof value.task !== "object" || Array.isArray(value.task)) return { ok:false, error:"TASK_MUST_BE_OBJECT" };
  const task = value.task;
  if (Object.keys(task).some((key) => !TASK_KEYS.has(key))) return { ok:false, error:"UNKNOWN_TASK_FIELD" };
  if (typeof task.task_id !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(task.task_id)) return { ok:false, error:"INVALID_TASK_ID" };
  if (typeof task.created_at !== "string" || !Number.isFinite(Date.parse(task.created_at))) return { ok:false, error:"INVALID_CREATED_AT" };
  if (task.source !== "chatgpt_go" && task.source !== "cerdikgo") return { ok:false, error:"INVALID_SOURCE" };
  if (typeof task.intent !== "string" || !task.intent.trim() || task.intent.length > MAX_INTENT_LENGTH) return { ok:false, error:"INVALID_INTENT" };
  if (!Array.isArray(task.agents) || task.agents.length < 1 || task.agents.length > 3) return { ok:false, error:"INVALID_AGENTS" };
  if (new Set(task.agents).size !== task.agents.length || task.agents.some((id) => !ALLOWED_AGENTS.includes(id))) return { ok:false, error:"AGENT_NOT_ALLOWED" };
  if (task.action_class !== "read_only" && task.action_class !== "controlled_action") return { ok:false, error:"INVALID_ACTION_CLASS" };
  return { ok:true, task:{ task_id:task.task_id, created_at:task.created_at, source:task.source, intent:task.intent.trim(), agents:[...task.agents], action_class:task.action_class } };
}

export function makeTaskEnvelope(task, exportedAt = new Date().toISOString()) {
  const checked = validateTaskEnvelope({ schema:TASK_SCHEMA, task });
  if (!checked.ok) throw new Error(checked.error);
  return { schema:TASK_SCHEMA, exported_at:exportedAt, task:checked.task };
}

export function isDuplicateTask(taskId, existingTasks) {
  return Array.isArray(existingTasks) && existingTasks.some((item) => item?.task?.task_id === taskId || item?.task_id === taskId);
}
