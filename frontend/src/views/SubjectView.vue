<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">교과</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <BtnLink class="btn" :to="'/admin'">관리자 설정</BtnLink>
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
      </div>
    </div>

    <!-- 관리자에 교과가 없을 때 안내 -->
    <div v-if="!subjectNames.length" class="card" style="padding:12px;margin-top:12px;">
      <p style="margin:0;">
        관리자의 <b>교과</b>가 설정되어 있지 않습니다. 관리자 페이지에서 교과를 추가하세요.
      </p>
    </div>

    <!-- 교과 탭: 관리자 설정 기반 -->
    <nav v-else style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
      <button v-for="name in subjectNames" :key="name"
              class="tab-btn" :class="{active: name===active}"
              @click="active = name">
        {{ name }}
      </button>
    </nav>

    <!-- 선택된 교과 패널 -->
    <section v-if="active" class="card" style="padding:12px;margin-top:12px;display:grid;gap:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <strong>수업:</strong>
          <span>{{ active }}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn" @click="pick">엑셀 업로드</button>
          <input ref="fileEl" type="file"
                 accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                 @change="onFile" style="display:none">
          <button class="btn" @click="downloadTemplate">샘플 템플릿</button>
          <button class="btn" @click="clearRoster">명단 비우기</button>
          <button class="btn" @click="exportAttendanceCsv" :disabled="!roster.length">출석 CSV</button>
        </div>
      </div>

      <p v-if="error" style="color:#dc2626;margin:0;">{{ error }}</p>

      <!-- 출석부 -->
      <div class="card" style="padding:10px;display:grid;gap:8px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <strong>출석부</strong>
          <input class="input" type="date" v-model="date" />
          <small style="color:var(--muted)">학생별 상태(출석/결석/지각/조퇴)를 선택하세요.</small>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button class="btn" @click="clearDay" :disabled="!Object.keys(dayMap).length">해당일 비우기</button>
          </div>
        </div>

        <table v-if="roster.length" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th class="th">학년</th>
              <th class="th">반</th>
              <th class="th">번호</th>
              <th class="th">성명</th>
              <th class="th">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in roster" :key="r['학생개인번호']">
              <td class="td">{{ r['학년'] }}</td>
              <td class="td">{{ r['반'] }}</td>
              <td class="td">{{ r['번호'] }}</td>
              <td class="td">{{ r['성명'] }}</td>
              <td class="td">
                <select class="input" style="min-width:120px"
                        :value="dayMap[r['학생개인번호']] || 'present'"
                        @change="(e)=>setStatus(r['학생개인번호'], e.target.value)">
                  <option value="present">출석</option>
                  <option value="absent">결석</option>
                  <option value="late">지각</option>
                  <option value="early">조퇴</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--muted);margin:0;">명단이 없습니다. 엑셀로 업로드하세요.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import BtnLink from '@/components/BtnLink.vue'
import { useSettingsStore } from '@/stores/settings'
import { useSubjectsStore } from '@/stores/subjects'

/**
 * 핵심 변경점:
 * - 탭은 settings.subjects(관리자 설정)에서 가져옴
 * - store(subjects)는 명단/출석 데이터만 관리 (탭 리스트는 settings 기반)
 */

const settings = useSettingsStore()
const subjects = useSubjectsStore()
onMounted(()=> subjects.init())

/* 관리자 교과 목록 */
const subjectNames = computed(() => {
  // settings.subjects: ['국어','수학', ...] 형태라고 가정
  const arr = Array.isArray(settings.subjects) ? settings.subjects : []
  // 빈 문자열/중복 제거
  return [...new Set(arr.map(s => String(s || '').trim()).filter(Boolean))]
})

/* 활성 탭 */
const active = ref('')
watch(subjectNames, (arr) => {
  if (!arr.length) { active.value = ''; return }
  if (!arr.includes(active.value)) active.value = arr[0]
}, { immediate: true })

/* 저장 시각 표시 */
const savedText = computed(()=>{
  if (!subjects.savedAt) return ''
  const d = new Date(subjects.savedAt)
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0')
  const hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})

/* 현재 교과의 명단/출석 */
const roster = computed(()=> subjects.roster(active.value))
const date = ref(today())
const dayMap = computed(()=> subjects.dayMap(active.value, date.value))

function today(){
  const d = new Date(), z = d.getTimezoneOffset()
  return new Date(d.getTime()-z*60000).toISOString().slice(0,10)
}
function setStatus(studentId, status){
  subjects.setStatus(active.value, date.value, studentId, status)
}
function clearDay(){
  if (!active.value) return
  if (confirm('해당 날짜의 출석을 모두 비울까요?')) subjects.clearDay(active.value, date.value)
}

/* 엑셀 업로드 (No, 학년, 반, 번호, 성명) */
const fileEl = ref(null)
const error = ref('')
function pick(){ fileEl.value?.click() }
function onFile(e){
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file || !active.value) return
  error.value=''

  const reader = new FileReader()
  reader.onerror = ()=> error.value='파일을 읽는 중 오류가 발생했습니다.'
  reader.onload = (ev)=>{
    try {
      const data = new Uint8Array(ev.target.result)
      const wb = XLSX.read(data, { type:'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { defval:'' })
      if (!json.length){ error.value='시트에 데이터가 없습니다.'; return }

      const need = ['No','학년','반','번호','성명']
      const head = Object.keys(json[0])
      const missing = need.filter(k=>!head.includes(k))
      if (missing.length){ error.value = `필수 열이 없습니다: ${missing.join(', ')}`; return }

      // No → 학생개인번호(중복 방지 자동 생성)
      const existingNos = collectExistingNos()
      const taken = new Set(existingNos)
      let next = nextNoNumber(existingNos)

      const rows = json.map(r=>{
        let finalNo = normNo(String(r['No']).trim())
        if (!finalNo || taken.has(finalNo)){ finalNo = makeNo(next); taken.add(finalNo); next++ }
        return {
          '학생개인번호': finalNo,
          '성명': String(r['성명']??'').trim(),
          '학년': r['학년']??'',
          '반': r['반']??'',
          '번호': r['번호']??'',
        }
      })
      subjects.setRoster(active.value, rows)
    } catch (err) {
      console.error(err); error.value='엑셀을 파싱하는 중 오류가 발생했습니다.'
    }
  }
  reader.readAsArrayBuffer(file)
}
function downloadTemplate(){
  const headers = ['No','학년','반','번호','성명']
  const rows = [
    ['No001',1,1,1,'김서윤'],
    ['No002',1,1,2,'이도윤']
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '수업명단')
  const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' })
  const blob = new Blob([wbout], { type:'application/octet-stream' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = '교과_수업명단_샘플.xlsx'; a.click(); URL.revokeObjectURL(a.href)
}
function clearRoster(){ if (active.value) subjects.clearRoster(active.value) }

/* No 유틸 (Club과 동일 규칙) */
function normNo(v){
  const s = String(v).trim(); if (!s) return ''
  const m1 = s.match(/^No\s*0*(\d+)$/i); if (m1) return makeNo(Number(m1[1]))
  const m2 = s.match(/^\d+$/); if (m2) return makeNo(Number(s))
  return ''
}
function makeNo(n){ return 'No' + String(Number(n)||0).padStart(3,'0') }
function collectExistingNos(){
  const ids = []
  // 모든 교과의 명단에서 수집
  for (const sid of Object.keys(subjects.rosters)){
    for (const s of subjects.rosters[sid] || []){
      const id = String(s['학생개인번호']||'').trim()
      const m = id.match(/^No0*(\d+)$/i); if (m) ids.push(makeNo(Number(m[1])))
    }
  }
  return ids
}
function nextNoNumber(arr){
  const nums = arr.map(s=>s.match(/^No0*(\d+)$/i)?.[1]).filter(Boolean).map(Number)
  const mx = nums.length ? Math.max(...nums) : 0
  return mx + 1
}

/* 출석 CSV (해당 날짜) */
function exportAttendanceCsv(){
  if (!roster.value.length){ alert('명단이 없습니다.'); return }
  const header = ['일자','수업','학생개인번호','성명','학년','반','번호','상태']
  const rows = roster.value.map(r=>{
    const st = dayMap.value[r['학생개인번호']] || 'present'
    return [date.value, active.value, r['학생개인번호'], r['성명'], r['학년'], r['반'], r['번호'], mapLabel(st)]
  })
  const csv = toCSV([header, ...rows])
  download('\uFEFF'+csv, 'text/csv;charset=utf-8', `교과_${active.value}_출석_${date.value}.csv`)
}
function mapLabel(s){ return s==='present'?'출석':s==='absent'?'결석':s==='late'?'지각':'조퇴' }
function toCSV(aoa){ return aoa.map(r=>r.map(csvEsc).join(',')).join('\n') }
function csvEsc(v){ const s=String(v??''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s }
function download(data, type, name){
  const blob = new Blob([data], { type })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<style scoped>
.tab-btn{ padding:6px 14px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; cursor:pointer; }
.tab-btn.active{ background:#fff; border-color:#3b82f6; color:#1d4ed8; font-weight:600; }
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:middle; }
</style>
