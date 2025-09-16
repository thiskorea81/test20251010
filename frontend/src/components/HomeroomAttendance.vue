<template>
  <section class="card" style="padding:12px; display:grid; gap:12px;">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h3 style="margin:0;">담임 출결 관리</h3>
      <small style="color:var(--muted)">학생 선택 후 생리결석·체험학습을 기록하세요.</small>
    </header>

    <!-- 학생 선택 -->
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
      <label>학생
        <select class="input" v-model="hakbun" style="min-width:220px; margin-left:6px;">
          <option disabled value="">선택</option>
          <option v-for="s in scoped" :key="s['학생개인번호']" :value="String(s['학생개인번호'])">
            {{ s['이름'] }} ({{ s['학년'] }}-{{ s['반'] }}-{{ s['번호'] }}) · {{ s['학생개인번호'] }}
          </option>
        </select>
      </label>
      <span v-if="sel" class="pill">
        성별: {{ sel['성별'] || '-' }} / 연락처: {{ sel['연락처'] || '-' }}
      </span>
    </div>

    <template v-if="sel">
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
    </template>

    <p v-else style="color:var(--muted); margin:0;">학생을 먼저 선택하세요.</p>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStudentsStore } from '@/stores/students'
import { isFemaleValue } from '@/utils/gender'
import { useSettingsStore } from '@/stores/settings'
import { useAttendanceStore } from '@/stores/attendance'

const students = useStudentsStore()
const settings = useSettingsStore()
const att = useAttendanceStore()

const scoped = computed(() => {
  if (!settings.hasHomeroom) return students.list
  return students.list.filter(s =>
    Number(s['학년']) === Number(settings.grade) &&
    Number(s['반']) === Number(settings.classNo)
  )
})

const hakbun = ref('')
const sel = computed(() => scoped.value.find(s => String(s['학생개인번호']) === hakbun.value))
const isFemale = computed(() => isFemaleValue(student.value?.['성별']))

/* ===== 생리결석 (월 1회) ===== */
const mDate = ref(new Date().toISOString().slice(0,10))
const mSubtype = ref('absent')
const mNote = ref('')

const menstrual = computed(() => att.menstrualList(hakbun.value))
function subtypeLabel(s){ return s==='absent' ? '결석' : s==='early' ? '조퇴' : '지각' }
const yyyymm = computed(() => mDate.value.slice(0,7))
const usedMonthAll = computed(() => att.menstrualCountMonthAll(hakbun.value, yyyymm.value))
const canAddMenstrual = computed(() => !!isFemale.value && !!mDate.value && usedMonthAll.value < 1)
function addMenstrual(){ if (canAddMenstrual.value) { att.addMenstrual(hakbun.value, { date: mDate.value, subtype: mSubtype.value, note: mNote.value }); mNote.value = '' } }
function removeMenstrual(id){ att.removeMenstrual(hakbun.value, id) }

/* ===== 체험학습 ===== */
const eDate = ref(new Date().toISOString().slice(0,10))
const eType = ref('domestic')
const eDays = ref(1)
const eNote = ref('')

const exp = computed(() => att.expList(hakbun.value))
const yyyy = computed(() => eDate.value.slice(0,4))
const usedDomestic = computed(() => att.expDaysUsed(hakbun.value, yyyy.value, 'domestic'))
const usedOverseas = computed(() => att.expDaysUsed(hakbun.value, yyyy.value, 'overseas'))
const remainDomestic = computed(() => Math.max(0, 7  - usedDomestic.value))
const remainOverseas = computed(() => Math.max(0, 30 - usedOverseas.value))
const canAddExp = computed(() => {
  const d = Number(eDays.value || 0)
  if (!eDate.value || d <= 0) return false
  return eType.value === 'domestic' ? d <= remainDomestic.value : d <= remainOverseas.value
})
function addExp(){ if (canAddExp.value) { att.addExp(hakbun.value, { date: eDate.value, type: eType.value, days: eDays.value, note: eNote.value }); eDays.value = 1; eNote.value = '' } }
function removeExp(id){ att.removeExp(hakbun.value, id) }

/* 초기 선택 */
watch(scoped, (list) => { if (!hakbun.value && list.length) hakbun.value = String(list[0]['학생개인번호']) }, { immediate: true })
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
