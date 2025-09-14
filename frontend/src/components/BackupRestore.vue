<template>
    <section class="card" style="padding:16px;">
      <h3 style="margin:0 0 12px;">데이터 백업/복원</h3>
  
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="btn" @click="exportJson">JSON 내보내기</button>
  
        <!-- 숨김 파일 입력 + 버튼으로 확실히 트리거 -->
        <button type="button" class="btn" @click="openFile">JSON 불러오기</button>
        <input ref="fileEl" type="file" accept="application/json" @change="importJson" style="display:none" />
  
        <button type="button" class="btn" @click="clearAll">전체 초기화</button>
  
        <small style="color:var(--muted)">브라우저 localStorage에 저장됩니다.</small>
      </div>
  
      <p v-if="error" style="margin-top:8px;color:#dc2626;">{{ error }}</p>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useDiaryStore } from '@/stores/diary'
  import { useWorklogStore } from '@/stores/worklog'
  import { useAuthStore } from '@/stores/auth'
  
  const diary = useDiaryStore()
  const worklog = useWorklogStore()
  const auth = useAuthStore()
  
  const fileEl = ref(null)
  const error = ref('')
  
  function ts() {
    const d = new Date(), z = n => String(n).padStart(2,'0')
    return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`
  }
  
  function exportJson() {
    error.value = ''
    const payload = {
      __meta: { app: 'teacher-diary', version: '0.1.0', exportedAt: new Date().toISOString() },
      stores: {
        diary: { ...diary.$state },
        worklog: { ...worklog.$state },
        auth: { ...auth.$state },
      }
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `teacher-diary-backup-${ts()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  
  function openFile(){
    error.value = ''
    fileEl.value?.click()
  }
  
  function importJson(e) {
    error.value = ''
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onerror = () => { error.value = '파일을 읽을 수 없습니다.' }
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data?.stores) throw new Error('잘못된 파일 형식')
        if (data.stores.diary) diary.$patch(data.stores.diary)
        if (data.stores.worklog) worklog.$patch(data.stores.worklog)
        if (data.stores.auth) auth.$patch(data.stores.auth)
        alert('복원이 완료되었습니다.')
      } catch (err) {
        console.error(err)
        error.value = '불러오기에 실패했습니다. 올바른 백업 파일인지 확인하세요.'
      } finally {
        // 같은 파일 다시 선택 가능하도록 리셋 (change 재발생 보장)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }
  
  function clearAll() {
    error.value = ''
    if (!confirm('정말 모든 데이터를 초기화할까요? 이 작업은 되돌릴 수 없습니다.')) return
    // Pinia state 초기화
    diary.$reset?.()
    worklog.$reset?.()
    auth.$reset?.()
    // localStorage도 정리 (Pinia 영속 키 프리픽스 'td:' 가정)
    Object.keys(localStorage).forEach(k => { if (k.startsWith('td:')) localStorage.removeItem(k) })
    alert('초기화되었습니다.')
    location.reload()
  }
  </script>
  