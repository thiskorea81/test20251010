<template>
  <section class="card" style="padding:16px;">
    <h3 style="margin:0 0 12px;">학생 업로드 (TSV 전용)</h3>

    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <button type="button" class="btn" @click="openPicker">TSV 선택</button>
      <input
        ref="fileEl"
        type="file"
        accept=".tsv,text/tab-separated-values"
        @change="onFile"
        style="display:none"
      />
      <button type="button" class="btn" @click="onClear">전체 삭제</button>

      <button type="button" class="btn" @click="downloadSampleTSV">샘플 TSV</button>

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
import Papa from 'papaparse'
import { useStudentsStore } from '@/stores/students'

const students = useStudentsStore()

// 새 양식 헤더(표시용)
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
  if (!file) return
  error.value = ''
  parsedInfo.value = ''

  const name = file.name.toLowerCase()
  if (!name.endsWith('.tsv')) {
    error.value = 'TSV 파일만 업로드할 수 있습니다. (확장자 .tsv)'
    e.target.value = ''
    return
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter: '\t',      // ✅ TSV 강제
    quotes: false,
    complete: (result) => {
      try {
        if (result.errors?.length) {
          error.value = '파싱 오류: ' + result.errors[0].message
          return
        }
        const fields = result.meta?.fields?.length ? result.meta.fields : headers.value
        const rows = (result.data || []).map(r => {
          const o = {}
          fields.forEach(h => { o[h] = (r[h] ?? '').toString().trim() })
          return o
        })
        students.addMany(rows)
        parsedInfo.value = `TSV(탭) · ${rows.length}행`
      } catch (err) {
        console.error(err)
        error.value = '업로드 중 오류가 발생했습니다.'
      } finally {
        e.target.value = ''
      }
    }
  })
}

function onClear() {
  students.clear()
  parsedInfo.value = ''
}

/* ========= 샘플 ========= */
function sampleRows() {
  return [
    { 학년:1, 반:1, 번호:1, 성명:'김서윤', 학생개인번호:'A20250001', 성별:'여', 생년월일:'2014-03-02',
      주소:'충북 청주시 상당구 예시로 10, 101호', 비고:'', 연락처:'010-1234-5678', 보호자1연락처:'010-1111-2222', 보호자2연락처:'010-2222-3333' },
    { 학년:1, 반:2, 번호:2, 성명:'이도윤', 학생개인번호:'A20250002', 성별:'남', 생년월일:'2014-05-11',
      주소:'충북 청주시 서원구 샘플길 25', 비고:'알레르기 있음', 연락처:'010-2222-3333', 보호자1연락처:'010-3333-4444', 보호자2연락처:'010-4444-5555' },
  ]
}

function toTSV(rows) {
  const cols = headers.value
  const esc = v => (v ?? '').toString().replaceAll('\t',' ').replaceAll('\n',' ')
  const lines = [cols.join('\t')]
  for (const r of rows) lines.push(cols.map(c => esc(r[c])).join('\t'))
  return lines.join('\n')
}
function download(data, type, name) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}
function downloadSampleTSV(){ download(toTSV(sampleRows()), 'text/tab-separated-values;charset=utf-8', '학생업로드_샘플.tsv') }
</script>
