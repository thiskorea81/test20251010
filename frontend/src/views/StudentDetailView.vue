<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">
        학생 상세
        <small v-if="stu" class="title-sub">
          {{stu['학년']}}학년 {{stu['반']}}반 {{ stu['번호'] || stu['학번'] }}번 {{ (stu['성명'] || stu['이름']) }}
        </small>
      </h2>
      <div style="display:flex;gap:8px;">
        <button class="btn" @click="toggleEdit" v-if="activeTab==='info' && stu">
          {{ editing ? '수정 취소' : '정보 수정' }}
        </button>
        <RouterLink class="btn" to="/homeroom">목록으로</RouterLink>
      </div>
    </div>

    <!-- 탭 -->
    <nav style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
      <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">
        {{ t.label }}
      </button>
    </nav>

    <div style="margin-top:12px;">
      <!-- 기본정보 -->
      <div v-if="activeTab==='info'">
        <template v-if="stu">
          <StudentBasicInfoCard
            v-if="!editing"
            :student="stu"
            :monthLabel="monthLabel"
            :menUsedAll="menUsedAll"
            :menRemainAll="menRemainAll"
            :usedDomestic="usedDomestic"
            :remainDomestic="remainDomestic"
            :usedOverseas="usedOverseas"
            :remainOverseas="remainOverseas"
          />
          <div v-else class="card" style="padding:16px;">
            <StudentEditForm :initial="form" @save="save" @cancel="toggleEdit" />
          </div>
        </template>
        <div v-else class="card" style="padding:16px;">
          <p>해당 학생을 찾을 수 없습니다. (학생개인번호 또는 학번 확인)</p>
          <RouterLink class="btn" to="/homeroom">목록으로</RouterLink>
        </div>
      </div>

      <!-- 상담 -->
      <div v-if="activeTab==='counsel'">
        <StudentCounsel :hakbun="paramId" />
      </div>

      <!-- 출결 -->
      <div v-if="activeTab==='attendance'">
        <div class="card" style="padding:12px;margin-bottom:12px;">
          <h3 style="margin:0 0 8px;">출결 요약</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span class="pill ok">({{ monthLabel }}) 생리결석: 남은 {{ menRemainAll }}/1 (사용 {{ menUsedAll }})</span>
            <span class="pill ok">올해 국내: 남은 {{ remainDomestic }}/7 (사용 {{ usedDomestic }})</span>
            <span class="pill ok">올해 국외: 남은 {{ remainOverseas }}/30 (사용 {{ usedOverseas }})</span>
          </div>
        </div>
        <StudentAttendance :hakbun="paramId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useAttendanceStore } from '@/stores/attendance'
import StudentCounsel from '@/components/StudentCounsel.vue'
import StudentAttendance from '@/components/StudentAttendance.vue'
import StudentBasicInfoCard from '@/components/student/StudentBasicInfoCard.vue'
import StudentEditForm from '@/components/student/StudentEditForm.vue'

const route = useRoute()
const students = useStudentsStore()
const att = useAttendanceStore()

/* 라우터 파라미터 */
const paramId = computed(() => String(route.params.hakbun ?? ''))

/* 안전 조회: 학생개인번호 우선, 없으면 학번으로도 시도 */
const stu = computed(() => {
  const byPersonal = students.byId?.(paramId.value)
  if (byPersonal) return byPersonal
  return students.list.find(s =>
    String(s['학생개인번호'] || '') === paramId.value ||
    String(s['학번'] || '') === paramId.value
  )
})

/* 탭 */
const tabs = [
  { key:'info', label:'기본정보' },
  { key:'counsel', label:'상담' },
  { key:'attendance', label:'출결' }
]
const activeTab = ref('info')

/* 편집 상태 + 폼 데이터 */
const editing = ref(false)
const form = reactive({
  학생개인번호:'', 학년:null, 반:null, 번호:null, 성명:'', 성별:'', 생년월일:'',
  연락처:'', 보호자1연락처:'', 보호자2연락처:'', 주소:'', 비고:''
})
watch(stu, s => {
  if (!s) return
  Object.assign(form, {
    학생개인번호: s['학생개인번호'] || s['학번'] || '',
    학년: Number(s['학년']), 반: Number(s['반']), 번호: Number(s['번호']),
    성명: s['성명'] || s['이름'] || '',
    성별: s['성별'] || '', 생년월일: s['생년월일'] || '',
    연락처: s['연락처'] || '',
    보호자1연락처: s['보호자1연락처'] || '',
    보호자2연락처: s['보호자2연락처'] || '',
    주소: s['주소'] || '', 비고: s['비고'] || ''
  })
}, { immediate:true })

function toggleEdit(){ editing.value = !editing.value }
function save(payload){
  // 이름 호환 필드도 함께 갱신
  students.update(payload['학생개인번호'], { ...payload, 이름: payload['성명'] })
  editing.value = false
  alert('저장되었습니다.')
}

/* 출결 요약 (월 1회 규칙) */
const today = new Date()
const yyyy = String(today.getFullYear())
const yyyymm = `${yyyy}-${String(today.getMonth()+1).padStart(2,'0')}`
const monthLabel = `${yyyy}.${String(today.getMonth()+1).padStart(2,'0')}`

const menUsedAll = computed(() => att.menstrualCountMonthAll(paramId.value, yyyymm))
const menRemainAll = computed(() => Math.max(0, 1 - (menUsedAll.value || 0)))
const usedDomestic = computed(() => att.expDaysUsed(paramId.value, yyyy, 'domestic'))
const usedOverseas = computed(() => att.expDaysUsed(paramId.value, yyyy, 'overseas'))
const remainDomestic = computed(() => Math.max(0, 7  - (usedDomestic.value || 0)))
const remainOverseas = computed(() => Math.max(0, 30 - (usedOverseas.value || 0)))
</script>

<style scoped>
.pill { display:inline-block; padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:#fff; font-size:13px; }
.pill.ok { background:#ecfdf5; border-color:#a7f3d0; }
.tab-btn { padding:6px 14px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; cursor:pointer; }
.tab-btn.active { background:#fff; border-color:#3b82f6; color:#1d4ed8; font-weight:600; }
.title-sub { margin-left:8px; color: var(--muted); font-weight:600; }
</style>
