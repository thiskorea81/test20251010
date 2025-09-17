<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">동아리</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn" @click="downloadTemplate">샘플 템플릿 다운로드</button>
        <BtnLink :to="'/club/notes'">업무 노트</BtnLink>
        <button class="btn" @click="exportAllActivitiesCsv" :disabled="!hasAnyActivity">전체 활동 CSV</button>
        <button class="btn" @click="clearAll">초기화</button>
      </div>
    </div>

    <section class="card" style="padding:12px;margin-top:12px;display:grid;gap:10px;">
      <h3 style="margin:0;">엑셀 업로드(.xlsx/.xls)</h3>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <button class="btn" @click="pick">파일 선택</button>
        <input
          ref="fileEl"
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          @change="onFile"
          style="display:none"
        />
        <small style="color:var(--muted)">{{ club.infoText }}</small>
      </div>
      <p v-if="error" style="color:#dc2626;margin:0;">{{ error }}</p>
      <small v-if="club.rows.length" style="color:var(--muted)">총 {{ club.rows.length }}명</small>
    </section>

    <!-- 학년/반/번호/성명만 표시, 행 클릭 시 활동기록 페이지로 -->
    <section v-if="club.rows.length" class="card" style="padding:12px;margin-top:12px;overflow:auto;">
      <h3 style="margin:0 0 8px;">동아리 명단</h3>
      <table style="width:max-content;border-collapse:collapse;min-width:100%;">
        <thead>
          <tr>
            <th class="th">학년</th>
            <th class="th">반</th>
            <th class="th">번호</th>
            <th class="th">성명</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in club.rows" :key="idx" class="row" @click="openActivity(r['학생개인번호'])">
            <td class="td">{{ r['학년'] }}</td>
            <td class="td">{{ r['반'] }}</td>
            <td class="td">{{ r['번호'] }}</td>
            <td class="td">{{ r['성명'] }}</td>
          </tr>
        </tbody>
      </table>
      <small style="display:block;margin-top:6px;color:var(--muted);">행을 클릭하면 활동내용을 기록할 수 있습니다.</small>
    </section>

    <p v-else class="card" style="padding:12px;margin-top:12px;color:var(--muted);">
      아직 업로드된 명단이 없습니다. (엑셀 첫 번째 시트를 사용합니다)
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useRouter } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useClubStore } from '@/stores/club'
import { useClubActivityStore } from '@/stores/clubActivity'
import BtnLink from '@/components/BtnLink.vue'

const router = useRouter()
const students = useStudentsStore()
const club = useClubStore()
const acts = useClubActivityStore()

const fileEl = ref(null)
const error = ref('')

function pick(){ fileEl.value?.click() }

function onFile(e){
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  error.value = ''

  const reader = new FileReader()
  reader.onerror = () => { error.value = '파일을 읽는 중 오류가 발생했습니다.' }
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const wsName = wb.SheetNames[0]
      const ws = wb.Sheets[wsName]
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) // [{No,학년,반,번호,성명}...]

      if (!json.length) { error.value = '시트에 데이터가 없습니다.'; return }

      // 필수 헤더 확인
      const need = ['No','학년','반','번호','성명']
      const headers = Object.keys(json[0])
      const missing = need.filter(k => !headers.includes(k))
      if (missing.length){ error.value = `필수 열이 없습니다: ${missing.join(', ')}`; return }

      // 기존/현재의 No들 수집 → 충돌 없이 다음 번호 생성
      const existingNos = collectExistingNos()
      const takenNos = new Set(existingNos)
      let nextNo = nextNoNumber(existingNos)

      const roster = json.map((r) => {
        let finalNo = normNo(String(r['No']).trim())
        if (!finalNo || takenNos.has(finalNo)) {
          finalNo = makeNo(nextNo); takenNos.add(finalNo); nextNo++
        }
        const personalId = finalNo
        return {
          No: finalNo,
          '학생개인번호': personalId,
          '성명': String(r['성명'] ?? '').trim(),
          '학년': r['학년'] ?? '',
          '반': r['반'] ?? '',
          '번호': r['번호'] ?? '',
        }
      })

      // students 스토어 추가
      students.addMany(
        roster.map(r => ({
          학생개인번호: r['학생개인번호'],
          성명: r['성명'],
          학년: r['학년'],
          반: r['반'],
          번호: r['번호'],
        }))
      )

      club.setRoster(roster, `${wsName} · ${roster.length}명`)
    } catch (err) {
      console.error(err)
      error.value = '엑셀을 파싱하는 중 오류가 발생했습니다.'
    }
  }
  reader.readAsArrayBuffer(file)
}

/* ===== No 생성 유틸 ===== */
function normNo(v){
  const s = String(v).trim()
  if (!s) return ''
  const m1 = s.match(/^No\s*0*(\d+)$/i)
  if (m1) return makeNo(Number(m1[1]))
  const m2 = s.match(/^\d+$/)
  if (m2) return makeNo(Number(s))
  return '' // 그 외는 새 발급
}
function makeNo(n){ return 'No' + String(Number(n)||0).padStart(3,'0') }
function collectExistingNos(){
  const arr = []
  for (const s of students.list) {
    const id = String(s['학생개인번호'] ?? '').trim()
    const m = id.match(/^No0*(\d+)$/i)
    if (m) arr.push(makeNo(Number(m[1])))
  }
  for (const r of club.rows) {
    const id = String(r['학생개인번호'] ?? '').trim()
    const m = id.match(/^No0*(\d+)$/i)
    if (m) arr.push(makeNo(Number(m[1])))
  }
  return arr
}
function nextNoNumber(existingNos){
  const nums = existingNos
    .map(s => (s.match(/^No0*(\d+)$/i)?.[1]))
    .filter(Boolean)
    .map(n => Number(n))
  const mx = nums.length ? Math.max(...nums) : 0
  return mx + 1
}

function clearAll(){ club.clear() }

function downloadTemplate(){
  const headers = ['No','학년','반','번호','성명']
  const rows = [
    ['No001',1,1,1,'김서윤'],
    ['No002',1,1,2,'이도윤'],
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '동아리명단')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '동아리_명단_샘플.xlsx'
  a.click()
  URL.revokeObjectURL(a.href)
}

/* 행 클릭 → 활동 기록 페이지로 */
function openActivity(studentId){
  if (!studentId) return
  router.push({ name: 'club-activity', params: { id: String(studentId) } })
}

/* ===== 전체 활동 CSV 내보내기 ===== */
const hasAnyActivity = computed(() => {
  const map = acts.byId || {}
  return Object.keys(map).some(k => (map[k] && map[k].length))
})

function exportAllActivitiesCsv(){
  const map = acts.byId || {}
  const rows = []
  const header = ['학생개인번호','성명','학년','반','번호','일시','내용']

  // 학생 조회 함수(없으면 club.rows에서 보조 조회)
  function findStudent(id){
    return students.list.find(s => String(s['학생개인번호']) === String(id))
        || club.rows.find(s => String(s['학생개인번호']) === String(id))
        || null
  }

  for (const id of Object.keys(map)){
    const list = map[id] || []
    const s = findStudent(id)
    const name = s?.['성명'] || s?.['이름'] || ''
    const grade = s?.['학년'] ?? ''
    const klass = s?.['반'] ?? ''
    const num = s?.['번호'] ?? ''
    for (const rec of list){
      rows.push([
        id,
        name,
        grade,
        klass,
        num,
        rec.datetime || '',
        rec.content || ''
      ])
    }
  }

  if (!rows.length){
    alert('내보낼 활동 기록이 없습니다.')
    return
  }

  const csv = toCSV([header, ...rows])
  downloadText('\uFEFF' + csv, 'text/csv;charset=utf-8', `동아리_전체활동_${yyyymmdd()}.csv`)
}

/* CSV 유틸 */
function toCSV(aoa){
  return aoa.map(r => r.map(csvEscape).join(',')).join('\n')
}
function csvEscape(v){
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`
  return s
}
function downloadText(data, mime, name){
  const blob = new Blob([data], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
function yyyymmdd(){
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${y}${m}${dd}`
}
</script>

<style scoped>
.th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; }
tr.row { cursor:pointer; }
tr.row:hover { background:#f9fafb; }
</style>
