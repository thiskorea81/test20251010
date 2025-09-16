<template>
  <section class="card" style="padding:16px;">
    <h3 style="margin:0 0 12px;">학생 업로드(NEIS 학생명렬표-선택(학생개인번호, 성별, 생년월일, 주소))</h3>

    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <button type="button" class="btn" @click="openPicker">엑셀 선택</button>
      <input
        ref="fileEl"
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        @change="onFile"
        style="display:none"
      />
      <button type="button" class="btn" @click="onClear">전체 삭제</button>
      <button type="button" class="btn" @click="downloadSampleXLSX">샘플 엑셀</button>

      <small style="color:var(--muted)">
        총 {{ students.list.length }}명
        <template v-if="parsedInfo"> · {{ parsedInfo }}</template>
      </small>
    </div>

    <p v-if="error" style="color:#dc2626;margin-top:8px;">{{ error }}</p>

    <table v-if="students.list.length" style="margin-top:12px;width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th v-for="h in headers" :key="h" style="border-bottom:1px solid var(--border);padding:4px;text-align:left;">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(s, i) in students.list" :key="i">
          <td v-for="h in headers" :key="h" style="border-bottom:1px solid var(--border);padding:4px;">
            {{ s[h] }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else style="margin-top:8px;color:var(--muted);">아직 업로드된 학생이 없습니다.</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useStudentsStore } from '@/stores/students'

const students = useStudentsStore()

// 요구 스키마(표시/내보내기 순서)
const headers = ref([
  '학년','반','번호','성명','학생개인번호','성별','생년월일','주소','비고','연락처','보호자1연락처','보호자2연락처'
])
const error = ref('')
const fileEl = ref(null)
const parsedInfo = ref('')

function openPicker() {
  error.value = ''
  fileEl.value?.click()
}

function onFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  error.value = ''
  parsedInfo.value = ''

  const name = file.name.toLowerCase()
  const ok = name.endsWith('.xlsx') || name.endsWith('.xls')
  if (!ok) {
    error.value = '엑셀(.xlsx/.xls) 파일만 업로드할 수 있습니다.'
    return
  }

  const reader = new FileReader()
  reader.onerror = () => { error.value = '파일을 읽는 중 오류가 발생했습니다.' }
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const wsName = wb.SheetNames[0]
      if (!wsName) { error.value = '시트를 찾을 수 없습니다.'; return }
      const ws = wb.Sheets[wsName]
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) // [{...row}]

      if (!json.length) { error.value = '시트에 데이터가 없습니다.'; return }

      // 엑셀에서 들어온 열들
      const excelHeaders = Object.keys(json[0])

      // 우리 스키마에 맞춰 매핑(없으면 빈문자)
      const rows = json.map(r => {
        const o = {}
        for (const h of headers.value) {
          // 엑셀에서 같은 이름 열이 있으면 사용, 없으면 빈칸
          o[h] = (r[h] ?? '').toString().trim()
        }
        return o
      })

      // 학생 스토어로 반영
      students.addMany(rows)
      parsedInfo.value = `엑셀 · ${rows.length}행 (${wsName})`

      // 스키마 누락 경고(정보성)
      const missing = headers.value.filter(h => !excelHeaders.includes(h))
      if (missing.length) {
        console.warn('누락된 열:', missing.join(', '))
      }
    } catch (err) {
      console.error(err)
      error.value = '엑셀을 파싱하는 중 오류가 발생했습니다.'
    }
  }
  reader.readAsArrayBuffer(file)
}

function onClear() {
  students.clear()
  parsedInfo.value = ''
}

/* ========= 샘플(엑셀) ========= */
function sampleRows() {
  return [
    { 학년:1, 반:1, 번호:1, 성명:'김서윤', 학생개인번호:'A20250001', 성별:'여', 생년월일:'2014-03-02',
      주소:'충북 청주시 상당구 예시로 10, 101호', 비고:'', 연락처:'010-1234-5678', 보호자1연락처:'010-1111-2222', 보호자2연락처:'010-2222-3333' },
    { 학년:1, 반:1, 번호:2, 성명:'이도윤', 학생개인번호:'A20250002', 성별:'남', 생년월일:'2014-05-11',
      주소:'충북 청주시 서원구 샘플길 25', 비고:'알레르기 있음', 연락처:'010-2222-3333', 보호자1연락처:'010-3333-4444', 보호자2연락처:'010-4444-5555' },
  ]
}
function downloadSampleXLSX(){
  const cols = headers.value
  const data = [cols, ...sampleRows().map(r => cols.map(c => r[c] ?? ''))]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '학생업로드샘플')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '학생업로드_샘플.xlsx'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>
