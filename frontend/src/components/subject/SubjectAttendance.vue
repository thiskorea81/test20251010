<template>
  <section class="card" style="padding:12px;display:grid;gap:10px;">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h3 style="margin:0;">출결 / 특이사항</h3>
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

    <div class="card" style="padding:10px;display:grid;gap:8px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <strong>출석부</strong>
        <input class="input" type="date" v-model="date" />
        <small style="color:var(--muted)">학생별 상태(출석/결석/지각/조퇴) 및 특이사항을 기록하세요.</small>
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
            <th class="th">특이사항(태도/발표/참여/메모)</th>
            <th class="th">저장</th>
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

            <!-- ✅ 인라인 특이사항 입력 -->
            <td class="td">
              <div style="display:grid;gap:6px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));align-items:center;">
                <input class="input" :value="noteOf(r).attitude" placeholder="태도"
                       @change="updateNote(r,'attitude',$event.target.value)" />
                <input class="input" :value="noteOf(r).presentation" placeholder="발표"
                       @change="updateNote(r,'presentation',$event.target.value)" />
                <input class="input" :value="noteOf(r).participation" placeholder="참여"
                       @change="updateNote(r,'participation',$event.target.value)" />
              </div>
              <textarea class="input" rows="2" :value="noteOf(r).memo" placeholder="기타 메모"
                        style="margin-top:6px;"
                        @change="updateNote(r,'memo',$event.target.value)"></textarea>
            </td>
            <td class="td" style="white-space:nowrap;">
              <button class="btn" @click="saveNote(r)">저장</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else style="color:var(--muted);margin:0;">명단이 없습니다. 엑셀로 업로드하세요.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useSubjectsStore } from '@/stores/subjects'
const props = defineProps({ subject: { type:String, required:true } })
const store = useSubjectsStore()

/* 날짜 */
function today(){
  const d = new Date(), z = d.getTimezoneOffset()
  return new Date(d.getTime()-z*60000).toISOString().slice(0,10)
}
const date = ref(today())
const dayMap = computed(()=> store.dayMap(props.subject, date.value))

/* 명단/출결 */
const roster = computed(()=> store.roster(props.subject))
function setStatus(id, status){ store.setStatus(props.subject, date.value, id, status) }
function clearDay(){ if (confirm('해당 날짜의 출석을 모두 비울까요?')) store.clearDay(props.subject, date.value) }

/* ==== 특이사항 (subjects.studentNotes) ==== */
function noteOf(r){
  const id = String(r['학생개인번호'])
  return store.studentNote(props.subject, id) || { attitude:'', presentation:'', participation:'', memo:'' }
}
const editBuffer = new Map() // { studentId -> partial updates }
function updateNote(r, key, val){
  const id = String(r['학생개인번호'])
  const base = { ...noteOf(r) }
  base[key] = val
  editBuffer.set(id, base)
}
function saveNote(r){
  const id = String(r['학생개인번호'])
  const payload = editBuffer.get(id) || noteOf(r)
  store.setStudentNote(props.subject, id, payload)
  editBuffer.delete(id)
  alert('저장되었습니다.')
}

/* 엑셀 업로드 */
const fileEl = ref(null)
const error = ref('')
function pick(){ fileEl.value?.click() }
function onFile(e){
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
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

      const { rows } = convertRows(json)
      store.setRoster(props.subject, rows)
    } catch (err) {
      console.error(err); error.value='엑셀을 파싱하는 중 오류가 발생했습니다.'
    }
  }
  reader.readAsArrayBuffer(file)
}
function downloadTemplate(){
  const headers = ['No','학년','반','번호','성명']
  const rows = [['No001',1,1,1,'김서윤'],['No002',1,1,2,'이도윤']]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '수업명단')
  const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' })
  const blob = new Blob([wbout], { type:'application/octet-stream' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = '교과_수업명단_샘플.xlsx'; a.click(); URL.revokeObjectURL(a.href)
}
function clearRoster(){ store.clearRoster(props.subject) }

/* No 유틸 */
function convertRows(json){
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
  return { rows }
}
function normNo(v){ const s=String(v).trim(); if(!s) return ''; const m1=s.match(/^No\s*0*(\d+)$/i); if(m1) return makeNo(Number(m1[1])); const m2=s.match(/^\d+$/); if(m2) return makeNo(Number(s)); return '' }
function makeNo(n){ return 'No' + String(Number(n)||0).padStart(3,'0') }
function collectExistingNos(){
  const ids=[]
  const all = store.rosters
  for (const k of Object.keys(all)){
    for (const s of all[k] || []){
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

/* CSV (해당 날짜) */
function exportAttendanceCsv(){
  if (!roster.value.length){ alert('명단이 없습니다.'); return }
  const header = ['일자','수업','학생개인번호','성명','학년','반','번호','상태']
  const rows = roster.value.map(r=>{
    const st = dayMap.value[r['학생개인번호']] || 'present'
    return [date.value, props.subject, r['학생개인번호'], r['성명'], r['학년'], r['반'], r['번호'], mapLabel(st)]
  })
  const csv = toCSV([header, ...rows])
  download('\uFEFF'+csv, 'text/csv;charset=utf-8', `교과_${props.subject}_출석_${date.value}.csv`)
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
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
</style>
