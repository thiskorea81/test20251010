<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">동아리 업무 노트</h2>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
        <BtnLink :to="'/club/budget'">예산 관리</BtnLink>
        <BtnLink :to="'/club'">동아리 명단</BtnLink>
      </div>
    </div>

    <!-- 탭 -->
    <nav style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab-btn"
        :class="{ active: active===t.key }"
        @click="active=t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <section class="card" style="padding:12px;margin-top:12px;">
      <!-- 운영 계획 -->
      <div v-if="active==='plan'" class="pane">
        <h3 style="margin:0 0 8px;">운영 계획</h3>
        <textarea
          class="input" rows="12" v-model="plan"
          @input="onInput('plan', plan)"
          placeholder="목표, 운영 방식, 예산, 평가 계획 등"
        />
      </div>

      <!-- 일정 메모 -->
      <div v-else-if="active==='schedule'" class="pane">
        <h3 style="margin:0 0 8px;">일정 메모</h3>
        <textarea
          class="input" rows="12" v-model="schedule"
          @input="onInput('schedule', schedule)"
          placeholder="주간/월간 일정, 일정 변경 메모 등"
        />
      </div>

      <!-- 회의록 -->
      <div v-else-if="active==='minutes'" class="pane">
        <h3 style="margin:0 0 8px;">회의록</h3>
        <textarea
          class="input" rows="12" v-model="minutes"
          @input="onInput('minutes', minutes)"
          placeholder="회의 일시/참석자/안건/결정 사항/액션 아이템 등"
        />
      </div>

      <!-- 공지/연락 -->
      <div v-else-if="active==='notice'" class="pane">
        <h3 style="margin:0 0 8px;">공지 · 연락</h3>
        <textarea
          class="input" rows="12" v-model="notice"
          @input="onInput('notice', notice)"
          placeholder="가정통신문/알림문 초안, 메시지 문구, 전달 일정 등"
        />
      </div>

      <!-- 예산 메모 -->
      <div v-else-if="active==='budget'" class="pane">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;">예산 메모</h3>
          <BtnLink :to="'/club/budget'">예산 상세 관리로 이동</BtnLink>
        </div>
        <textarea
          class="input" rows="12" v-model="budgetMemo"
          @input="onInput('budget', budgetMemo)"
          placeholder="총예산 배분, 집행 원칙, 정산 메모 등을 자유롭게 적어두세요."
        />
      </div>

      <!-- 체크리스트 (공용 컴포넌트) -->
      <div v-else class="pane">
        <Checklist
          title="체크리스트"
          :items="tasks"
          :allowAdd="true"
          placeholder="동아리 할 일을 입력하세요"
          @add="addTask"
          @toggle="toggleTask"
          @remove="removeTask"
          @clearDone="clearDone"
          @sort="sortTasks"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BtnLink from '@/components/BtnLink.vue'
import Checklist from '@/components/Checklist.vue'
import { useClubNotesStore } from '@/stores/clubNotes'

const notes = useClubNotesStore()

const tabs = [
  { key:'plan',     label:'운영 계획' },
  { key:'schedule', label:'일정 메모' },
  { key:'minutes',  label:'회의록' },
  { key:'notice',   label:'공지 · 연락' },
  { key:'budget',   label:'예산 메모' },
  { key:'tasks',    label:'체크리스트' },
]
const active = ref('plan')

onMounted(() => {
  notes.init?.()
  // 초기 로드
  plan.value = notes.plan || ''
  schedule.value = notes.schedule || ''
  minutes.value = notes.minutes || ''
  notice.value = notes.notice || ''
  budgetMemo.value = notes.budget || ''   // store에 budget 필드가 없어도 setField로 생성됨
})

/* 바인딩 */
const plan = ref('')
const schedule = ref('')
const minutes = ref('')
const notice = ref('')
const budgetMemo = ref('')

/* 체크리스트: store 바인딩 (배열 참조 유지) */
const tasks = computed(() => notes.tasks || [])

/* 입력 핸들러 */
function onInput(key, val){ notes.setField(key, val) }

/* 체크리스트 핸들러 (Checklist에서 이벤트로 호출) */
function addTask(text){ notes.addTask(text) }
function toggleTask(id){ notes.toggleTask(id) }
function removeTask(id){ notes.removeTask(id) }
function clearDone(){ notes.sortTasks(); notes.tasks = notes.tasks.filter(t => !t.done); notes.persist() }
function sortTasks(){ notes.sortTasks() }

/* 저장됨 표시 */
const savedText = computed(() => {
  if (!notes.savedAt) return ''
  const d = new Date(notes.savedAt)
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})
</script>

<style scoped>
.tab-btn {
  padding:6px 14px;
  border:1px solid var(--border);
  border-radius:6px;
  background:#f9fafb;
  cursor:pointer;
}
.tab-btn.active {
  background:#fff;
  border-color:#3b82f6;
  color:#1d4ed8;
  font-weight:600;
}
.pane { display:grid; gap:8px; }
</style>
