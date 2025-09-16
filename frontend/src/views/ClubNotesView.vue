<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">동아리 업무 노트</h2>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
        <RouterLink class="btn" to="/club">동아리 명단</RouterLink>
      </div>
    </div>

    <!-- 탭 -->
    <nav style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
      <button v-for="t in tabs" :key="t.key"
              class="tab-btn" :class="{ active: active===t.key }"
              @click="active=t.key">
        {{ t.label }}
      </button>
    </nav>

    <section class="card" style="padding:12px;margin-top:12px;">
      <!-- 운영 계획 -->
      <div v-if="active==='plan'" class="pane">
        <h3 style="margin:0 0 8px;">운영 계획</h3>
        <textarea class="input" rows="12" v-model="plan" @input="onInput('plan', plan)"
                  placeholder="목표, 운영 방식, 예산, 평가 계획 등"></textarea>
      </div>

      <!-- 일정 메모 -->
      <div v-else-if="active==='schedule'" class="pane">
        <h3 style="margin:0 0 8px;">일정 메모</h3>
        <textarea class="input" rows="12" v-model="schedule" @input="onInput('schedule', schedule)"
                  placeholder="주간/월간 일정, 일정 변경 메모 등"></textarea>
      </div>

      <!-- 회의록 -->
      <div v-else-if="active==='minutes'" class="pane">
        <h3 style="margin:0 0 8px;">회의록</h3>
        <textarea class="input" rows="12" v-model="minutes" @input="onInput('minutes', minutes)"
                  placeholder="회의 일시/참석자/안건/결정 사항/액션 아이템 등"></textarea>
      </div>

      <!-- 공지/연락 -->
      <div v-else-if="active==='notice'" class="pane">
        <h3 style="margin:0 0 8px;">공지 · 연락</h3>
        <textarea class="input" rows="12" v-model="notice" @input="onInput('notice', notice)"
                  placeholder="가정통신문/알림문 초안, 메시지 문구, 전달 일정 등"></textarea>
      </div>

      <!-- 체크리스트 -->
      <div v-else class="pane">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;">체크리스트</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn" @click="sortTasks">정렬(미완료 먼저)</button>
            <button class="btn" @click="clearTasksConfirm">전체 삭제</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;">
          <input class="input" v-model="taskText" placeholder="할 일 입력 후 Enter" @keydown.enter.prevent="addTask" style="min-width:280px;">
          <button class="btn primary" @click="addTask">추가</button>
        </div>

        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;">
          <li v-for="t in tasks" :key="t.id" class="task">
            <label style="display:flex;gap:8px;align-items:center;">
              <input type="checkbox" v-model="t.done" @change="toggleTask(t.id)">
              <span :style="{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--muted)' : 'inherit' }">
                {{ t.text }}
              </span>
            </label>
            <div style="display:flex;gap:6px;">
              <button class="btn" @click="removeTask(t.id)">삭제</button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClubNotesStore } from '@/stores/clubNotes'

const notes = useClubNotesStore()

const tabs = [
  { key:'plan',     label:'운영 계획' },
  { key:'schedule', label:'일정 메모' },
  { key:'minutes',  label:'회의록' },
  { key:'notice',   label:'공지 · 연락' },
  { key:'tasks',    label:'체크리스트' },
]
const active = ref('plan')

onMounted(() => { notes.init() })

/* 바인딩 */
const plan = ref(''); const schedule = ref(''); const minutes = ref(''); const notice = ref('')
const tasks = ref([]); const taskText = ref('')

onMounted(() => {
  plan.value = notes.plan; schedule.value = notes.schedule
  minutes.value = notes.minutes; notice.value = notes.notice
  tasks.value = notes.tasks
})

function onInput(key, val){ notes.setField(key, val) }

function addTask(){ const t = taskText.value.trim(); if (!t) return; notes.addTask(t); tasks.value = notes.tasks; taskText.value='' }
function toggleTask(id){ notes.toggleTask(id); tasks.value = notes.tasks }
function removeTask(id){ notes.removeTask(id); tasks.value = notes.tasks }
function sortTasks(){ notes.sortTasks(); tasks.value = notes.tasks }
function clearTasksConfirm(){ if (!confirm('체크리스트를 전부 삭제할까요?')) return; notes.tasks = []; notes.persist(); tasks.value = [] }

const savedText = computed(() => {
  if (!notes.savedAt) return ''
  const d = new Date(notes.savedAt)
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0')
  const hh = String(d.getHours()).padStart(2,'0'), mm = String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})
</script>

<style scoped>
.tab-btn { padding:6px 14px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; cursor:pointer; }
.tab-btn.active { background:#fff; border-color:#3b82f6; color:#1d4ed8; font-weight:600; }
.task{
  display:flex; justify-content:space-between; align-items:center;
  padding:8px; border:1px solid var(--border); border-radius:8px; background:#fff;
}
</style>
