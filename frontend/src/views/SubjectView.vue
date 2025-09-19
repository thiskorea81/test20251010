<template>
  <div>
    <!-- 상단 바 -->
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">교과</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <BtnLink class="btn" :to="'/admin'">관리자 설정</BtnLink>
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
      </div>
    </div>

    <!-- 관리자에 교과 없음 안내 -->
    <div v-if="!subjectNames.length" class="card" style="padding:12px;margin-top:12px;">
      <p style="margin:0;">관리자의 <b>교과</b>가 설정되어 있지 않습니다. 관리자 페이지에서 교과를 추가하세요.</p>
    </div>

    <!-- 상위 과목 탭 -->
    <nav v-else style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
      <button v-for="name in subjectNames" :key="name"
              class="tab-btn" :class="{active: name===active}"
              @click="active = name">
        {{ name }}
      </button>
    </nav>

    <!-- 메인 2열 레이아웃 -->
    <section v-if="active" class="card" style="padding:12px;margin-top:12px;">
      <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        <div><strong>수업:</strong> {{ active }}</div>
        <small style="color:var(--muted)">과목별 데이터는 브라우저에 자동 저장됩니다.</small>
      </header>

      <div class="grid">
        <!-- 왼쪽: 콘텐츠 -->
        <div class="main">
          <SubjectCalendar     v-if="sub==='cal'"    :subject="active" />
          <SubjectChecklist    v-else-if="sub==='todo'" :subject="active" />
          <SubjectEvalPlan     v-else-if="sub==='eval'" :subject="active" />
          <SubjectProgress     v-else-if="sub==='prog'" :subject="active" />
          <SubjectLessonNotes  v-else-if="sub==='note'" :subject="active" />
          <SubjectActivities   v-else-if="sub==='act'"  :subject="active" />
          <SubjectAttendance   v-else                   :subject="active" />
        </div>

        <!-- 오른쪽: 서브 탭(세로) -->
        <aside class="side">
          <nav class="side-nav">
            <button v-for="t in subTabs" :key="t.key"
                    class="side-btn" :class="{active: t.key===sub}"
                    @click="sub=t.key">
              {{ t.label }}
            </button>
          </nav>
        </aside>
      </div>
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
  { key:'att',  label:'출결' }, // 특이사항은 별도 페이지
]
const sub = ref('cal')
</script>

<style scoped>
.tab-btn{ padding:6px 14px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; cursor:pointer; }
.tab-btn.active{ background:#fff; border-color:#3b82f6; color:#1d4ed8; font-weight:600; }

/* 2열 레이아웃 */
.grid{
  display:grid;
  grid-template-columns: 1fr 240px; /* 왼쪽 컨텐츠, 오른쪽 사이드 */
  gap: 12px;
}
.main{ min-width:0; }
.side{
  min-width: 220px;
}
.side-nav{
  position: sticky;
  top: 12px;
  display: grid;
  gap: 6px;
}
.side-btn{
  padding:10px 12px;
  border:1px solid var(--border);
  border-radius:8px;
  background:#f9fafb;
  text-align:left;
  cursor:pointer;
  width:100%;
}
.side-btn.active{
  background:#fff;
  border-color:#3b82f6;
  color:#1d4ed8;
  font-weight:600;
}

/* 모바일/협소 화면: 한 열로 전환 */
@media (max-width: 860px){
  .grid{ grid-template-columns: 1fr; }
  .side{ order:-1; } /* 탭을 위쪽에 표시 */
  .side-nav{ position:static; display:flex; flex-wrap:wrap; }
  .side-btn{ width:auto; }
}
</style>
