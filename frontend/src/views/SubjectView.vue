<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">교과</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <BtnLink class="btn" :to="'/admin'">관리자 설정</BtnLink>
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
      </div>
    </div>

    <div v-if="!subjectNames.length" class="card" style="padding:12px;margin-top:12px;">
      <p style="margin:0;">관리자의 <b>교과</b>가 설정되어 있지 않습니다. 관리자 페이지에서 교과를 추가하세요.</p>
    </div>

    <nav v-else style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
      <button v-for="name in subjectNames" :key="name"
              class="tab-btn" :class="{active: name===active}"
              @click="active = name">
        {{ name }}
      </button>
    </nav>

    <section v-if="active" class="card" style="padding:12px;margin-top:12px;display:grid;gap:12px;">
      <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <div><strong>수업:</strong> {{ active }}</div>
        <small style="color:var(--muted)">과목별 데이터는 브라우저에 자동 저장됩니다.</small>
      </header>

      <!-- 서브 탭 (특이사항 제거, 출결 탭에 통합) -->
      <nav style="display:flex;gap:8px;flex-wrap:wrap;">
        <button v-for="t in subTabs" :key="t.key"
                class="tab-btn" :class="{active: t.key===sub}"
                @click="sub=t.key">
          {{ t.label }}
        </button>
      </nav>

      <SubjectCalendar     v-if="sub==='cal'"    :subject="active" />
      <SubjectChecklist    v-else-if="sub==='todo'" :subject="active" />
      <SubjectEvalPlan     v-else-if="sub==='eval'" :subject="active" />
      <SubjectProgress     v-else-if="sub==='prog'" :subject="active" />
      <SubjectLessonNotes  v-else-if="sub==='note'" :subject="active" />
      <SubjectActivities   v-else-if="sub==='act'"  :subject="active" />
      <SubjectAttendance   v-else                   :subject="active" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BtnLink from '@/components/BtnLink.vue'
import { useSettingsStore } from '@/stores/settings'
import { useSubjectsStore } from '@/stores/subjects'

import SubjectCalendar from '@/components/subject/SubjectCalendar.vue'
import SubjectChecklist from '@/components/subject/SubjectChecklist.vue'
import SubjectEvalPlan from '@/components/subject/SubjectEvalPlan.vue'
import SubjectProgress from '@/components/subject/SubjectProgress.vue'
import SubjectLessonNotes from '@/components/subject/SubjectLessonNotes.vue'
import SubjectActivities from '@/components/subject/SubjectActivities.vue'
import SubjectAttendance from '@/components/subject/SubjectAttendance.vue'

const settings = useSettingsStore()
const subjects = useSubjectsStore()
onMounted(()=> subjects.init?.())

const subjectNames = computed(()=>{
  const arr = Array.isArray(settings.subjects) ? settings.subjects : []
  return [...new Set(arr.map(s=>String(s||'').trim()).filter(Boolean))]
})

const active = ref('')
watch(subjectNames, (arr)=>{
  if (!arr.length){ active.value=''; return }
  if (!arr.includes(active.value)) active.value = arr[0]
}, { immediate:true })

const savedText = computed(()=>{
  if (!subjects.savedAt) return ''
  const d = new Date(subjects.savedAt)
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0')
  const hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})

const subTabs = [
  { key:'cal',  label:'수업 캘린더' },
  { key:'todo', label:'할일목록' },
  { key:'eval', label:'평가계획' },
  { key:'prog', label:'진도표' },
  { key:'note', label:'수업정리/노트' },
  { key:'act',  label:'학생 활동' },
  { key:'att',  label:'출결/특이사항' },  // ✅ 통합
]
const sub = ref('cal')
</script>

<style scoped>
.tab-btn{ padding:6px 14px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; cursor:pointer; }
.tab-btn.active{ background:#fff; border-color:#3b82f6; color:#1d4ed8; font-weight:600; }
</style>
