<template>
  <div class="approval-page">
    <header>
      <h2>Approval Workflows</h2>
      <p class="subtitle">
        Define approval chains for requests (amount, department, project, type).
        This is a simple demo UI — data is stored in-memory.
      </p>
    </header>

    <section class="form-card">
      <h3>Create / Add Rule</h3>

      <div class="row">
        <label>
          Trigger type
          <select v-model="form.triggerType">
            <option value="amount">Amount &gt;=</option>
            <option value="department">Department</option>
            <option value="project">Project</option>
            <option value="type">Request Type</option>
          </select>
        </label>

        <label v-if="form.triggerType === 'amount'">
          Amount threshold
          <input v-model.number="form.threshold" type="number" min="0" />
        </label>

        <label v-else>
          Match value
          <input v-model="form.match" placeholder="e.g. Marketing or Travel" />
        </label>
      </div>

      <div class="row">
        <label>
          Approval mode
          <select v-model="form.mode">
            <option value="sequential">Sequential</option>
            <option value="parallel">Parallel</option>
          </select>
        </label>

        <label>
          Delegation allowed
          <input type="checkbox" v-model="form.delegation" />
        </label>

        <label>
          Notifications
          <input type="checkbox" v-model="form.notifications" />
        </label>
      </div>

      <div class="row">
        <label style="flex: 2">
          Approvers (comma separated emails or roles)
          <input
            v-model="approverInput"
            placeholder="alice@..., manager, ceo"
          />
        </label>
        <button class="btn primary" @click="addApprovers">Add</button>
      </div>

      <div class="row small">
        <label style="flex: 1">
          Comment / Instructions
          <input
            v-model="form.comment"
            placeholder="Optional guidance for approvers"
          />
        </label>
      </div>

      <div class="actions">
        <button class="btn primary" @click="saveRule">Save Rule</button>
        <button class="btn" @click="resetForm">Reset</button>
      </div>
    </section>

    <section class="rules-list">
      <h3>Configured Rules</h3>
      <div v-if="rules.length === 0" class="empty">
        No rules yet — create one above.
      </div>

      <ul>
        <li v-for="r in rules" :key="r.id" class="rule">
          <div class="rule-left">
            <strong>{{ r.title }}</strong>
            <div class="meta">
              <span>Trigger: {{ r.triggerLabel }}</span>
              <span>Mode: {{ r.mode }}</span>
              <span>Delegation: {{ r.delegation ? "yes" : "no" }}</span>
              <span>Notif: {{ r.notifications ? "on" : "off" }}</span>
            </div>
            <div class="approvers">
              Approvers:
              <span v-for="(a, i) in r.approvers" :key="i" class="chip">{{
                a
              }}</span>
            </div>
            <div v-if="r.comment" class="comment">Note: {{ r.comment }}</div>
          </div>

          <div class="rule-actions">
            <button class="btn" @click="editRule(r.id)">Edit</button>
            <button class="btn danger" @click="removeRule(r.id)">Remove</button>
            <button class="btn" @click="toggleActive(r.id)">
              {{ r.active ? "Disable" : "Enable" }}
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

let nextId = 1;

const rules = ref([]);

// form state
const form = reactive({
  id: null,
  triggerType: "amount",
  threshold: 0,
  match: "",
  mode: "sequential",
  delegation: false,
  notifications: true,
  approvers: [],
  comment: "",
});

const approverInput = ref("");

function makeTitle(f) {
  if (f.triggerType === "amount") return `Amount >= ${f.threshold}`;
  return `${f.triggerType}: ${f.match || "(any)"}`;
}

function resetForm() {
  form.id = null;
  form.triggerType = "amount";
  form.threshold = 0;
  form.match = "";
  form.mode = "sequential";
  form.delegation = false;
  form.notifications = true;
  form.approvers = [];
  form.comment = "";
  approverInput.value = "";
}

function addApprovers() {
  const raw = (approverInput.value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const a of raw) {
    if (!form.approvers.includes(a)) form.approvers.push(a);
  }
  approverInput.value = "";
}

function saveRule() {
  if (!form.approvers.length) {
    alert("Add at least one approver.");
    return;
  }

  const payload = {
    id: form.id || nextId++,
    triggerType: form.triggerType,
    threshold: form.triggerType === "amount" ? Number(form.threshold) : null,
    match: form.triggerType === "amount" ? null : form.match,
    mode: form.mode,
    delegation: Boolean(form.delegation),
    notifications: Boolean(form.notifications),
    approvers: [...form.approvers],
    comment: form.comment,
    active: true,
    title: makeTitle(form),
    triggerLabel:
      form.triggerType === "amount"
        ? `Amount ≥ ${form.threshold}`
        : `${form.triggerType}: ${form.match || "any"}`,
  };

  const idx = rules.value.findIndex((r) => r.id === payload.id);
  if (idx === -1) rules.value.push(payload);
  else rules.value.splice(idx, 1, payload);

  resetForm();
}

function editRule(id) {
  const r = rules.value.find((x) => x.id === id);
  if (!r) return;
  form.id = r.id;
  form.triggerType = r.triggerType;
  form.threshold = r.threshold ?? 0;
  form.match = r.match ?? "";
  form.mode = r.mode;
  form.delegation = r.delegation;
  form.notifications = r.notifications;
  form.approvers = [...r.approvers];
  form.comment = r.comment || "";
  approverInput.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function removeRule(id) {
  if (!confirm("Remove this rule?")) return;
  const idx = rules.value.findIndex((r) => r.id === id);
  if (idx !== -1) rules.value.splice(idx, 1);
}

function toggleActive(id) {
  const r = rules.value.find((x) => x.id === id);
  if (r) r.active = !r.active;
}
</script>

<style scoped>
.approval-page {
  padding: 20px;
  font-family: Inter, system-ui, sans-serif;
}
.subtitle {
  color: #555;
  margin-bottom: 12px;
  max-width: 60ch;
}
.form-card {
  background: var(--card, #fff);
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 18px;
  box-shadow: var(--shadow, 0 4px 12px rgba(0, 0, 0, 0.05));
}
.row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}
.row.small {
  gap: 8px;
}
label {
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 13px;
}
input[type="number"],
input[type="text"],
select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.btn {
  padding: 8px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #eef2f6;
  color: #0b2740;
}
.btn.primary {
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  color: white;
}
.btn.danger {
  background: #fee2e2;
  color: #991b1b;
}
.rules-list {
  margin-top: 8px;
}
.rule {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f0f3f6;
  margin-bottom: 8px;
  background: #fff;
  align-items: flex-start;
}
.rule-left {
  flex: 1;
}
.rule .meta {
  display: flex;
  gap: 12px;
  color: #555;
  font-size: 12px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.chip {
  display: inline-block;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 999px;
  margin: 4px 6px 0 0;
  font-size: 12px;
}
.comment {
  margin-top: 6px;
  color: #333;
  font-size: 13px;
}
.empty {
  color: #777;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}
.rule-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
