<template>
  <section class="card" style="padding:12px; display:grid; gap:12px;">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h3 style="margin:0;">출결 관리</h3>
      <small style="color:var(--muted)">{{ studentLabel }}</small>
    </header>

    <!-- 생리결석: 유형 무관 월 1회 -->
    <div class="card" style="padding:10px; display:grid; gap:8px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <strong>생리결석</strong>
        <small style="color:var(--muted)">지각/조퇴/결석 구분 없이 <b>월 1회</b>만 기록</small>
      </div>

      <div v-if="isFemale" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <input type="date" class="input" v-model="mDate" />
        <select class="input" v-model="mSubtype" style="min-width:120px;">
          <option value="absent">결석</option>
          <option value="early">조퇴</option>
          <option value="late">지각</option>
        </select>
        <input class="input" v-model="mNote" placeholder="비고(선택)" style="min-width:240px;" />
        <button class="btn primary" :disabled="!canAddMenstrual" @click="addMenstrual">추가</button>
        <span v-if="!canAddMenstrual" class="pill warn">이번 달 이미 1회 기록됨</span>
      </div>
      <p v-else style="color:var(--muted); margin:0;">여학생이 아닙니다.</p>

      <table v-if="menstrual.length" style="width:100%; border-collapse:collapse; margin-top:6px;">
        <thead><tr>
          <th class="th">날짜</th><th class="th">유형</th><th class="th">비고</th><th class="th">작업</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in menstrual" :key="r.id">
            <td class="td">{{ r.date }}</td>
            <td class="td">{{ subtypeLabel(r.subtype) }}</td>
            <td class="td">{{ r.note }}</td>
            <td class="td"><button class="btn" @click="removeMenstrual(r.id)">삭제</button></td>
          </tr>
        </tbody>
      </table>
      <p v-else style="color:var(--muted); margin:0;">기록 없음</p>
    </div>

    <!-- 체험학습 -->
    <div class="card" style="padding:10px; display:grid; gap:8px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <strong>체험학습</strong>
        <small style="color:var(--muted)">연간 한도: 국내 7일 / 국외 30일</small>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <input type="date" class="input" v-model="eDate" />
        <select class="input" v-model="eType" style="min-width:120px;">
          <option value="domestic">국내</option>
          <option value="overseas">국외</option>
        </select>
        <input class="input" type="number" min="1" v-model.number="eDays" style="width:120px;" placeholder="일수" />
        <input class="input" v-model="eNote" placeholder="비고(선택)" style="min-width:240px;" />
        <button class="btn primary" :disabled="!canAddExp" @click="addExp">추가</button>
        <span v-if="!canAddExp" class="pill warn">한도 초과</span>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
        <span class="pill ok">올해 국내 남은 일수: {{ remainDomestic }}</span>
        <span class="pill ok">올해 국외 남은 일수: {{ remainOverseas }}</span>
      </div>

      <table v-if="exp.length" style="width:100%; border-collapse:collapse; margin-top:6px;">
        <thead><tr>
          <th class="th">날짜</th><th class="th">구분</th><th class="th">일수</th><th class="th">비고</th><th class="th">작업</th>
        </tr></thead>
        <tbody>
          <tr v-for="r in exp" :key="r.id">
            <td class="td">{{ r.date }}</td>
            <td class="td">{{ r.type === 'domestic' ? '국내' : '국외' }}</td>
            <td class="td">{{ r.days }}</td>
            <td class="td">{{ r.note }}</td>
            <td class="td"><button class="btn" @click="removeExp(r.id)">삭제</button></td>
          </tr>
        </tbody>
      </table>
      <p v-else style="color:var(--muted); margin:0;">기록 없음</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStudentsStore } from '@/stores/students'
import { isFemaleValue } from '@/utils/gender'
import { useAttendanceStore } from '@/stores/attendance'

const props = defineProps({ hakbun: { type: [String, Number], required: true } })

const students = useStudentsStore()
const att = useAttendanceStore()

/* 학생 조회: 학생개인번호 기준 */
const student = computed(() => {
   const id = String(props.hakbun)
   return students.list.find(s =>
     String(s['학생개인번호'] || '') === id ||
     String(s['학번'] || '') === id
   )
})

/* 라벨: 성명 우선, 없으면 이름 */
const studentLabel = computed(() => {
  if (!student.value) return String(props.hakbun)
  const name = student.value['성명'] || student.value['이름'] || ''
  return `${name} (${student.value['학생개인번호']})`
})

/* 성별 판별 (혼합 입력 대응) */
const isFemale = computed(() => isFemaleValue(student.value?.['성별']))

/* 로컬(한국시간) YYYY-MM-DD 생성 */
function toLocalDate(d = new Date()){
  const dt = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return dt.toISOString().slice(0,10)
}

/* ===== 생리결석 (월 1회, 유형 무관) ===== */
const mDate = ref(toLocalDate())
const mSubtype = ref('absent')
const mNote = ref('')

const menstrual = computed(() => att.menstrualList(String(props.hakbun)))
function subtypeLabel(s){ return s==='absent' ? '결석' : s==='early' ? '조퇴' : '지각' }
const yyyymm = computed(() => mDate.value.slice(0,7))
const usedMonthAll = computed(() => att.menstrualCountMonthAll(String(props.hakbun), yyyymm.value))
const canAddMenstrual = computed(() => !!isFemale.value && !!mDate.value && usedMonthAll.value < 1)

function addMenstrual(){
  if (!canAddMenstrual.value) return
  att.addMenstrual(String(props.hakbun), { date: mDate.value, subtype: mSubtype.value, note: mNote.value })
  mNote.value = ''
}
function removeMenstrual(id){ att.removeMenstrual(String(props.hakbun), id) }

/* ===== 체험학습 ===== */
const eDate = ref(toLocalDate())
const eType = ref('domestic')
const eDays = ref(1)
const eNote = ref('')

const exp = computed(() => att.expList(String(props.hakbun)))
const yyyy = computed(() => eDate.value.slice(0,4))
const usedDomestic = computed(() => att.expDaysUsed(String(props.hakbun), yyyy.value, 'domestic') || 0)
const usedOverseas = computed(() => att.expDaysUsed(String(props.hakbun), yyyy.value, 'overseas') || 0)
const remainDomestic = computed(() => Math.max(0, 7  - usedDomestic.value))
const remainOverseas = computed(() => Math.max(0, 30 - usedOverseas.value))
const canAddExp = computed(() => {
  const d = Number(eDays.value || 0)
  if (!eDate.value || d <= 0) return false
  return eType.value === 'domestic' ? d <= remainDomestic.value : d <= remainOverseas.value
})
function addExp(){
  if (!canAddExp.value) return
  att.addExp(String(props.hakbun), { date: eDate.value, type: eType.value, days: eDays.value, note: eNote.value })
  eDays.value = 1; eNote.value = ''
}
function removeExp(id){ att.removeExp(String(props.hakbun), id) }
</script>

<style scoped>
.th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; }
.pill{
  padding:4px 8px; border-radius:999px; border:1px solid var(--border);
  background:#fff; font-size:12px;
}
.pill.ok{ background:#ecfdf5; border-color:#a7f3d0; }
.pill.warn{ background:#fff7ed; border-color:#fed7aa; }
</style>
