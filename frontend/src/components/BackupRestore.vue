<template>
  <section class="card" style="padding:16px;">
    <h3 style="margin:0 0 12px;">데이터 백업/복원</h3>

    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <button type="button" class="btn" @click="exportJson">JSON 내보내기</button>

      <button type="button" class="btn" @click="openFile">JSON 불러오기</button>
      <input ref="fileEl" type="file" accept="application/json" @change="importJson" style="display:none" />

      <button type="button" class="btn" @click="clearAll">전체 초기화</button>

      <small style="color:var(--muted)">
        브라우저 localStorage에 저장됩니다. (백업에 포함: auth/diary/worklog/students/counsel/settings)
      </small>
    </div>

    <p v-if="error" style="margin-top:8px;color:#dc2626;">{{ error }}</p>

    <!-- 간단 요약 -->
    <ul style="margin:8px 0 0 16px; color:var(--muted); font-size:14px;">
      <li>학생: {{ studentsCount }}명</li>
      <li>상담: {{ counselCount }}건</li>
      <li>업무일지: {{ worklogDates }}개 날짜</li>
      <li>할 일: {{ diaryCount }}개 (완료 {{ diaryDone }}개)</li>
      <li>담임학급: {{ settingsSummary }}</li>
      <li>로그인: {{ authSummary }}</li>
    </ul>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== Pinia stores =====
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { useWorklogStore } from '@/stores/worklog'
import { useStudentsStore } from '@/stores/students'
import { useCounselStore } from '@/stores/counsel'
import { useSettingsStore } from '@/stores/settings'

const auth = useAuthStore()
const diary = useDiaryStore()
const worklog = useWorklogStore()
const students = useStudentsStore()
const counsel = useCounselStore()
const settings = useSettingsStore()

// ===== UI state =====
const fileEl = ref(null)
const error = ref('')

// ===== 요약 =====
const studentsCount = computed(() => students.list.length)
const counselCount  = computed(() => Object.values(counsel.byStudent).reduce((a, arr) => a + (arr?.length||0), 0))
const worklogDates  = computed(() => Object.keys(worklog.byDate || {}).length)
const diaryCount    = computed(() => diary.items.length)
const diaryDone     = computed(() => diary.items.filter(i => i.done).length)
const settingsSummary = computed(() =>
  (Number(settings.grade) && Number(settings.classNo))
    ? `${settings.grade}학년 ${settings.classNo}반 / 교과 ${settings.subjects?.length||0}개`
    : `미설정 / 교과 ${settings.subjects?.length||0}개`
)
const authSummary = computed(() => auth.isAuthenticated ? `로그인됨 (${auth.user?.id||'admin'})` : '로그아웃')

// ===== helpers =====
function ts() {
  const d = new Date(), z = n => String(n).padStart(2,'0')
  return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`
}

// ===== export =====
function exportJson() {
  error.value = ''
  const payload = {
    __meta: {
      app: 'teacher-diary',
      version: '0.2.0',
      exportedAt: new Date().toISOString(),
    },
    stores: {
      auth : { ...auth.$state },
      diary: { ...diary.$state },
      worklog: { ...worklog.$state },
      students: { ...students.$state },
      counsel : { ...counsel.$state },
      settings: { ...settings.$state },
    }
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `teacher-diary-backup-${ts()}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ===== import =====
function openFile(){
  error.value = ''
  fileEl.value?.click()
}

function importJson(e) {
  error.value = ''
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onerror = () => { error.value = '파일을 읽을 수 없습니다.' }
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      if (!data?.stores) throw new Error('잘못된 파일 형식')

      // 각각 patch (없는 건 건너뜀)
      data.stores.auth     && auth.$patch(data.stores.auth)
      data.stores.diary    && diary.$patch(data.stores.diary)
      data.stores.worklog  && worklog.$patch(data.stores.worklog)
      data.stores.students && students.$patch(data.stores.students)
      data.stores.counsel  && counsel.$patch(data.stores.counsel)
      data.stores.settings && settings.$patch(data.stores.settings)

      alert('복원이 완료되었습니다.')
    } catch (err) {
      console.error(err)
      error.value = '불러오기에 실패했습니다. 올바른 백업 파일인지 확인하세요.'
    } finally {
      // 같은 파일 다시 선택 가능하도록 리셋
      e.target.value = ''
    }
  }
  reader.readAsText(file)
}

// ===== clear all =====
// Pinia persist 플러그인이 'td:' 프리픽스를 쓴다고 가정(필요 시 프로젝트 설정과 맞추세요)
function clearAll() {
  error.value = ''
  if (!confirm('정말 모든 데이터를 초기화할까요? 이 작업은 되돌릴 수 없습니다.')) return

  // 스토어 리셋 (정의된 경우)
  auth.$reset?.()
  diary.$reset?.()
  worklog.$reset?.()
  students.$reset?.()
  counsel.$reset?.()
  settings.$reset?.()

  // localStorage 키 정리
  const prefix = 'td:' // ← 프로젝트의 실제 프리픽스와 맞춰주세요
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(prefix)) keys.push(k)
  }
  keys.forEach(k => localStorage.removeItem(k))

  alert('초기화되었습니다.')
  location.reload()
}
</script>
