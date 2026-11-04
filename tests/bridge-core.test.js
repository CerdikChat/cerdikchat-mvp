import test from "node:test";
import assert from "node:assert/strict";
import { TASK_SCHEMA, validateTaskEnvelope, makeTaskEnvelope, isDuplicateTask } from "../src/bridge-core.js";

const validTask={task_id:"cg_12345678",created_at:"2026-11-04T12:00:00.000Z",source:"chatgpt_go",intent:"Review this project safely",agents:["ATLAS-01","ATLAS-09"],action_class:"read_only"};
const envelope={schema:TASK_SCHEMA,exported_at:"2026-11-04T12:01:00.000Z",task:validTask};

test("accepts a valid ChatGPT Go task envelope",()=>{const result=validateTaskEnvelope(envelope);assert.equal(result.ok,true);assert.equal(result.task.task_id,validTask.task_id);});
test("rejects unsupported schema and extra fields",()=>{assert.equal(validateTaskEnvelope({...envelope,schema:"other"}).error,"UNSUPPORTED_SCHEMA");assert.equal(validateTaskEnvelope({...envelope,task:{...validTask,execute:true}}).error,"UNKNOWN_TASK_FIELD");});
test("rejects invalid agent selection and oversized intent",()=>{assert.equal(validateTaskEnvelope({...envelope,task:{...validTask,agents:["ATLAS-10"]}}).error,"AGENT_NOT_ALLOWED");assert.equal(validateTaskEnvelope({...envelope,task:{...validTask,intent:"x".repeat(4001)}}).error,"INVALID_INTENT");});
test("rejects duplicate agents and invalid action class",()=>{assert.equal(validateTaskEnvelope({...envelope,task:{...validTask,agents:["ATLAS-01","ATLAS-01"]}}).error,"AGENT_NOT_ALLOWED");assert.equal(validateTaskEnvelope({...envelope,task:{...validTask,action_class:"production_write"}}).error,"INVALID_ACTION_CLASS");});
test("envelope builder validates before export",()=>{assert.equal(makeTaskEnvelope(validTask).schema,TASK_SCHEMA);assert.throws(()=>makeTaskEnvelope({...validTask,source:"unknown"}),/INVALID_SOURCE/);});
test("duplicate task IDs are detected",()=>{assert.equal(isDuplicateTask("cg_12345678",[{task:validTask}]),true);assert.equal(isDuplicateTask("cg_other000",[{task:validTask}]),false);});
