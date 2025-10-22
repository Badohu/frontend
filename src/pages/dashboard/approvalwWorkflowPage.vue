<template>
  <div class="workflow-page">
    <header>
      <h2>Approval Workflows</h2>
      <p class="subtitle">
        Configure multi-level approval chains and simulate runs
      </p>
    </header>

    <section class="layout">
      <!-- workflow list -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <button class="btn primary" @click="startNew">+ New Workflow</button>
        </div>

        <ul class="workflow-list">
          <li
            v-for="wf in workflows"
            :key="wf.id"
            :class="{ active: selected && selected.id === wf.id }"
            @click="selectWorkflow(wf.id)"
          >
            <div class="wf-title">{{ wf.name }}</div>
            <div class="wf-meta">
              {{ wf.mode }} · {{ wf.levels.length }} levels
            </div>
          </li>
        </ul>
      </aside>

      <!-- editor / viewer -->
      <main class="editor">
        <div v-if="!selected" class="empty">
          Select a workflow or create a new one to begin.
        </div>

        <div v-else class="editor-panel">
          <div class="editor-header">
            <h3>
              {{ editing ? "Edit Workflow" : "Workflow Details" }}
            </h3>
            <div class="actions">
              <button class="btn" @click="duplicateWorkflow(selected.id)">
                Duplicate
              </button>
              <button class="btn danger" @click="deleteWorkflow(selected.id)">
                Delete
              </button>
            </div>
          </div>

          <!-- form -->
          <form @submit.prevent="saveWorkflow">
            <label>
              Name
              <input v-model="selected.name" required />
            </label>

            <label class="inline">
              Trigger by minimum amount (USD)
              <input
                v-model.number="selected.trigger.minAmount"
                type="number"
                min="0"
              />
            </label>

            <label class="inline">
              Project (comma separated, empty = any)
              <input
                v-model="selected.trigger.projects"
                placeholder="Project A,Project B"
              />
            </label>

            <label class="inline">
              Department (comma separated)
              <input
                v-model="selected.trigger.departments"
                placeholder="Finance,IT"
              />
            </label>

            <label class="inline">
              Request types (comma separated)
              <input
                v-model="selected.trigger.types"
                placeholder="Travel,Procurement"
              />
            </label>

            <label class="inline">
              Mode
              <select v-model="selected.mode">
                <option value="Sequential">Sequential</option>
                <option value="Parallel">Parallel</option>
              </select>
            </label>

            <label class="inline">
              Allow Delegation
              <input type="checkbox" v-model="selected.allowDelegation" />
            </label>

            <section class="levels">
              <h4>Approval Levels</h4>
              <div
                v-for="(lvl, idx) in selected.levels"
                :key="lvl.id"
                class="level-row"
              >
                <div class="level-info">
                  <input
                    v-model="lvl.name"
                    placeholder="Approver name or role"
                  />
                  <select v-model="lvl.type">
                    <option value="Role">Role</option>
                    <option value="User">User</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
                <div class="level-actions">
                  <button
                    type="button"
                    class="btn"
                    @click="moveLevelUp(idx)"
                    :disabled="idx === 0"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="btn"
                    @click="moveLevelDown(idx)"
                    :disabled="idx === selected.levels.length - 1"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    class="btn danger"
                    @click="removeLevel(idx)"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div class="add-level">
                <input v-model="newLevelName" placeholder="Name or role" />
                <select v-model="newLevelType">
                  <option value="Role">Role</option>
                  <option value="User">User</option>
                  <option value="Group">Group</option>
                </select>
                <button type="button" class="btn" @click="addLevel">
                  Add Level
                </button>
              </div>
            </section>

            <div class="form-actions">
              <button type="submit" class="btn primary">Save</button>
              <button type="button" class="btn" @click="cancelEdit">
                Cancel
              </button>
              <button type="button" class="btn" @click="triggerDemo">
                Trigger Demo
              </button>
            </div>
          </form>

          <!-- comments & notifications -->
          <section class="comments">
            <h4>Comments & Activity</h4>
            <ul class="comment-list">
              <li v-for="c in selected.comments" :key="c.id">
                <div class="comment-meta">
                  <strong>{{ c.author }}</strong> · <small>{{ c.ts }}</small>
                </div>
                <div class="comment-body">{{ c.text }}</div>
              </li>
            </ul>

            <div class="add-comment">
              <input
                v-model="commentText"
                placeholder="Add a comment or instruction"
              />
              <button class="btn" @click="addComment">Add</button>
            </div>

            <div class="notif">
              <label
                ><input type="checkbox" v-model="selected.notifyEmail" /> Email
                notifications</label
              >
              <label
                ><input type="checkbox" v-model="selected.notifyInApp" /> In-app
                notifications</label
              >
            </div>
          </section>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

/* Persistence key */
const STORAGE_KEY = "approval_workflows_v1";

/* helper: create id */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* sample seed */
const defaultWorkflows = [
  {
    id: uid(),
    name: "Small purchases",
    trigger: {
      minAmount: 0,
      projects: "",
      departments: "Operations",
      types: "",
    },
    mode: "Sequential",
    allowDelegation: true,
    levels: [
      { id: uid(), name: "Team Lead", type: "Role" },
      { id: uid(), name: "Finance Manager", type: "Role" },
    ],
    comments: [],
    notifyEmail: false,
    notifyInApp: true,
  },
  {
    id: uid(),
    name: "Capital purchases",
    trigger: {
      minAmount: 50000,
      projects: "",
      departments: "Operations,IT",
      types: "Procurement",
    },
    mode: "Parallel",
    allowDelegation: false,
    levels: [
      { id: uid(), name: "Procurement Lead", type: "Role" },
      { id: uid(), name: "CFO", type: "User" },
    ],
    comments: [],
    notifyEmail: true,
    notifyInApp: true,
  },
];

/* reactive state */
const workflows = ref([]);
const selected = ref(null);
const editing = ref(false);

/* form helpers for levels */
const newLevelName = ref("");
const newLevelType = ref("Role");

/* comment box */
const commentText = ref("");

/* persistence */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      workflows.value = JSON.parse(raw);
    } else {
      workflows.value = defaultWorkflows;
      save();
    }
  } catch {
    workflows.value = defaultWorkflows;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows.value));
  } catch (e) {
    console.warn("save failed", e);
  }
}

/* selection / editing */
function selectWorkflow(id) {
  const wf = workflows.value.find((w) => w.id === id);
  if (!wf) return;
  // create a shallow copy for editing so changes are applied via save
  selected.value = reactive(clone(wf));
  editing.value = false;
}

function startNew() {
  const wf = {
    id: uid(),
    name: "New workflow",
    trigger: { minAmount: 0, projects: "", departments: "", types: "" },
    mode: "Sequential",
    allowDelegation: false,
    levels: [],
    comments: [],
    notifyEmail: false,
    notifyInApp: false,
  };
  workflows.value.unshift(wf);
  selectWorkflow(wf.id);
  editing.value = true;
  save();
}

function saveWorkflow() {
  if (!selected.value) return;
  const idx = workflows.value.findIndex((w) => w.id === selected.value.id);
  if (idx === -1) {
    workflows.value.unshift(clone(selected.value));
  } else {
    workflows.value.splice(idx, 1, clone(selected.value));
  }
  editing.value = false;
  save();
}

/* helpers to clone reactive data into plain objects */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cancelEdit() {
  if (!selected.value) return;
  // reload original from stored list to discard changes
  const orig = workflows.value.find((w) => w.id === selected.value.id);
  if (orig) selected.value = reactive(clone(orig));
  editing.value = false;
}

/* manage levels */
function addLevel() {
  if (!newLevelName.value) return;
  selected.value.levels.push({
    id: uid(),
    name: newLevelName.value.trim(),
    type: newLevelType.value,
  });
  newLevelName.value = "";
  newLevelType.value = "Role";
  editing.value = true;
}

function removeLevel(idx) {
  selected.value.levels.splice(idx, 1);
  editing.value = true;
}

function moveLevelUp(idx) {
  if (idx === 0) return;
  const arr = selected.value.levels;
  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
  editing.value = true;
}

function moveLevelDown(idx) {
  const arr = selected.value.levels;
  if (idx === arr.length - 1) return;
  [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
  editing.value = true;
}

/* comments */
function addComment() {
  if (!commentText.value || !selected.value) return;
  selected.value.comments.unshift({
    id: uid(),
    author: "CurrentUser",
    text: commentText.value.trim(),
    ts: new Date().toLocaleString(),
  });
  commentText.value = "";
  editing.value = true;
}

/* delete / duplicate */
function deleteWorkflow(id) {
  if (!confirm("Delete workflow?")) return;
  const idx = workflows.value.findIndex((w) => w.id === id);
  if (idx !== -1) workflows.value.splice(idx, 1);
  selected.value = null;
  save();
}

function duplicateWorkflow(id) {
  const wf = workflows.value.find((w) => w.id === id);
  if (!wf) return;
  const copy = clone(wf);
  copy.id = uid();
  copy.name = wf.name + " (copy)";
  workflows.value.unshift(copy);
  save();
}

/* trigger demo: simulate running the workflow for a sample request */
async function triggerDemo() {
  if (!selected.value) return alert("Select a workflow first");
  // create demo request matching trigger criteria
  const demo = {
    id: "demo-" + uid(),
    project:
      (selected.value.trigger.projects || "").split(",").filter(Boolean)[0] ||
      "DemoProject",
    department:
      (selected.value.trigger.departments || "")
        .split(",")
        .filter(Boolean)[0] || "DemoDept",
    type:
      (selected.value.trigger.types || "").split(",").filter(Boolean)[0] ||
      "General",
    amount: Math.max(1, selected.value.trigger.minAmount || 0) + 1,
    status: "Running",
  };

  notify(
    selected.value,
    `Workflow "${selected.value.name}" triggered for demo request ${demo.id}`
  );

  // simulate approvals
  const levels = selected.value.levels.slice();
  if (!levels.length) {
    notify(selected.value, "No approvers configured - auto-approved");
    return;
  }

  if (selected.value.mode === "Parallel") {
    // run all approvals concurrently
    await Promise.all(
      levels.map((lvl) => simulateApproval(lvl, selected.value))
    );
    notify(
      selected.value,
      `All approvers have approved request ${demo.id} (parallel)`
    );
  } else {
    // sequential
    for (const lvl of levels) {
      const ok = await simulateApproval(lvl, selected.value);
      if (!ok) {
        notify(selected.value, `Request ${demo.id} rejected by ${lvl.name}`);
        return;
      }
    }
    notify(selected.value, `Request ${demo.id} approved (sequential)`);
  }
}

/* simulate approval step */
function simulateApproval(level, wf) {
  return new Promise((resolve) => {
    // mock delay
    setTimeout(() => {
      // simulate delegation: if delegation allowed, random chance to be delegated
      const delegated = wf.allowDelegation && Math.random() < 0.2;
      const actor = delegated ? `${level.name} (delegated)` : level.name;
      // simulate approve/reject (small chance of reject)
      const approved = Math.random() > 0.05;
      notify(
        wf,
        `${actor} ${approved ? "approved" : "rejected"} (level: ${level.name})`
      );
      resolve(approved);
    }, 600 + Math.random() * 600);
  });
}

/* notification helper (for demo: console + stored comment) */
function notify(wf, text) {
  // push as in-app activity
  wf.comments.unshift({
    id: uid(),
    author: "system",
    text,
    ts: new Date().toLocaleString(),
  });
  if (wf.notifyEmail) console.info("Email:", text);
  if (wf.notifyInApp) console.info("InApp:", text);
  save();
}

/* load on mount */
onMounted(load);
</script>

<style scoped>
.workflow-page {
  padding: 18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  color: #0b1220;
}
.subtitle {
  color: #4b5563;
  margin-bottom: 12px;
}

.layout {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

/* sidebar */
.sidebar {
  width: 240px;
}
.sidebar-header {
  margin-bottom: 12px;
}
.workflow-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.workflow-list li {
  padding: 10px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.workflow-list li.active {
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.08);
  border-color: rgba(79, 70, 229, 0.08);
}
.wf-title {
  font-weight: 600;
}
.wf-meta {
  color: #6b7280;
  font-size: 0.85rem;
}

/* editor */
.editor {
  flex: 1;
}
.editor-panel {
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(11, 18, 32, 0.04);
}
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.actions .btn {
  margin-left: 8px;
}

/* form */
label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.95rem;
}
label.inline {
  display: flex;
  gap: 8px;
  align-items: center;
}
input[type="text"],
input[type="number"],
select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  width: 100%;
  box-sizing: border-box;
}
.levels {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eef2f6;
}
.level-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.level-info {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
}
.level-actions button {
  margin-left: 6px;
}

/* comments */
.comments {
  margin-top: 12px;
  border-top: 1px dashed #eef2f7;
  padding-top: 12px;
}
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
  max-height: 220px;
  overflow: auto;
}
.comment-list li {
  padding: 8px;
  border-radius: 6px;
  background: #fbfdff;
  margin-bottom: 6px;
}
.comment-meta {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 6px;
}
.add-comment {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* buttons */
.btn {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn.primary {
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  color: #fff;
  border: none;
}
.btn.danger {
  background: #fee2e2;
  color: #991b1b;
  border: none;
}

/* responsive */
@media (max-width: 920px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    order: 2;
  }
}
</style>
