<template>
  <section class="card" style="padding:16px;">
    <h3 style="margin:0 0 12px;">학생 업로드 (CSV/TSV)</h3>

    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <button type="button" class="btn" @click="openPicker">파일 선택</button>
      <input
        ref="fileEl"
        type="file"
        accept=".csv,text/csv,.tsv,text/tab-separated-values"
        @change="onFile"
        style="display:none"
      />
      <button type="button" class="btn" @click="onClear">전체 삭제</button>

      <!-- ✅ 샘플 양식 다운로드 버튼 -->
      <button type="button" class="btn" @click="downloadSampleCSV">샘플 CSV 다운로드</button>
      <button type="button" class="btn" @click="downloadSampleTSV">샘플 TSV 다운로드</button>

      <small style="color:var(--muted)">
        {{ infoText }}
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
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import { useStudentsStore } from '@/stores/students'

const students = useStudentsStore()
const headers = ref([
  // 기본 양식 헤더
  '학번','학년','반','번호','이름','성별','연락처','보호자1연락처','보호자2연락처','주소','비고'
])
const error = ref('')
const fileEl = ref(null)
const parsedInfo = ref('')

const infoText = computed(() =>
  `총 ${students.list.length}명` + (headers.value.length ? ` · 컬럼 ${headers.value.length}` : '')
)

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
  const isTSV = name.endsWith('.tsv')
  const delimiter = isTSV ? '\t' : undefined

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    quotes: true,
    complete: (result) => {
      try {
        if (result.errors?.length) {
          error.value = '파싱 오류: ' + result.errors[0].message
          return
        }
        headers.value = result.meta?.fields?.length ? result.meta.fields : headers.value

        const rows = (result.data || []).map(r => {
          const o = {}
          headers.value.forEach(h => { o[h] = (r[h] ?? '').toString().trim() })
          return o
        })
        students.addMany(rows)

        const delimLabel = isTSV ? 'TSV(탭)' : 'CSV(,)'
        parsedInfo.value = `${delimLabel} · ${rows.length}행`
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

/* ========= 샘플 다운로드 ========= */
function sampleRows() {
  return [
    {
      학번: '1010101', 학년: 1, 반: 1, 번호: 1, 이름: '김서윤', 성별: '여',
      연락처: '010-1234-5678', 보호자1연락처: '010-1111-2222', 보호자2연락처: '010-2222-3333',
      주소: '충북 청주시 상당구 예시로 10, 101호', 비고: ''
    },
    {
      학번: '1020202', 학년: 1, 반: 2, 번호: 2, 이름: '이도윤', 성별: '남',
      연락처: '010-2222-3333', 보호자1연락처: '010-3333-4444', 보호자2연락처: '010-4444-5555',
      주소: '충북 청주시 서원구 샘플길 25', 비고: '알레르기 있음'
    },
    {
      학번: '2030303', 학년: 2, 반: 3, 번호: 3, 이름: '박하린', 성별: '여',
      연락처: '010-4444-5555', 보호자1연락처: '010-5555-6666', 보호자2연락처: '010-6666-7777',
      주소: '충북 청주시 흥덕구 테스트로 77, 3층', 비고: ''
    },
    {
      학번: '3040404', 학년: 3, 반: 4, 번호: 4, 이름: '최시우', 성별: '남',
      연락처: '010-7777-8888', 보호자1연락처: '010-8888-9999', 보호자2연락처: '010-0000-1111',
      주소: '충북 청주시 청원구 예시길 8', 비고: '전학 예정'
    },
    {
      학번: '4050505', 학년: 4, 반: 5, 번호: 5, 이름: '정예준', 성별: '남',
      연락처: '010-9999-0000', 보호자1연락처: '010-0000-1111', 보호자2연락처: '010-1212-3434',
      주소: '충북 청주시 상당구 가상로 12, 1202호', 비고: ''
    }
  ]
}

function toCSV(rows) {
  const cols = headers.value
  const escape = v => {
    const s = (v ?? '').toString()
    const needsQuote = s.includes(',') || s.includes('"') || s.includes('\n')
    const body = s.replaceAll('"','""')
    return needsQuote ? `"${body}"` : body
  }
  const lines = []
  lines.push(cols.join(','))
  for (const r of rows) lines.push(cols.map(c => escape(r[c])).join(','))
  return '\ufeff' + lines.join('\n')
}

function toTSV(rows) {
  const cols = headers.value
  const escape = v => (v ?? '').toString().replaceAll('\t',' ').replaceAll('\n',' ')
  const lines = []
  lines.push(cols.join('\t'))
  for (const r of rows) lines.push(cols.map(c => escape(r[c])).join('\t'))
  return lines.join('\n')
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadSampleCSV() {
  const data = toCSV(sampleRows())
  download(new Blob([data], { type: 'text/csv;charset=utf-8' }), '학생업로드_샘플.csv')
}
function downloadSampleTSV() {
  const data = toTSV(sampleRows())
  download(new Blob([data], { type: 'text/tab-separated-values;charset=utf-8' }), '학생업로드_샘플.tsv')
}
</script>
