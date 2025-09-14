<template>
    <section class="card" style="padding:16px;">
      <h3 style="margin:0 0 12px;">학생 업로드 (CSV)</h3>
  
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <button type="button" class="btn" @click="openPicker">CSV 선택</button>
        <input ref="fileEl" type="file" accept=".csv,text/csv" @change="onFile" style="display:none" />
        <button type="button" class="btn" @click="onClear">전체 삭제</button>
        <small style="color:var(--muted)">{{ infoText }}</small>
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
  const headers = ref([])
  const error = ref('')
  const fileEl = ref(null)
  
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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          if (result.errors?.length) {
            error.value = 'CSV 파싱 오류: ' + result.errors[0].message
            return
          }
          headers.value = result.meta?.fields || []
          const rows = (result.data || []).map(r => {
            const o = {}
            headers.value.forEach(h => { o[h] = (r[h] ?? '').toString().trim() })
            return o
          })
          students.addMany(rows)
        } catch (err) {
          console.error(err)
          error.value = '업로드 중 오류가 발생했습니다.'
        } finally {
          // 같은 파일 다시 선택 가능하도록 리셋
          e.target.value = ''
        }
      }
    })
  }
  
  function onClear() {
    students.clear()
    headers.value = []
  }
  </script>
  