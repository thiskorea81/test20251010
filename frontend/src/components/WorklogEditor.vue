<template>
    <div class="card" style="padding:12px;">
      <header style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <h3 style="margin:0;">업무일지</h3>
  
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <!-- 날짜 네비게이션 -->
          <div class="card" style="padding:4px;display:flex;align-items:center;gap:6px;">
            <button class="btn" @click="goPrev">‹</button>
            <strong>{{ prettyDate }}</strong>
            <button class="btn" @click="goNext">›</button>
            <button class="btn" @click="goToday">오늘</button>
          </div>
  
          <!-- 저장 상태 표시 -->
          <span v-if="saving" class="pill">저장 중…</span>
          <span v-else-if="saved" class="pill ok">저장됨</span>
        </div>
      </header>
  
      <textarea
        class="input"
        style="margin-top:8px;min-height:140px;resize:vertical;"
        :value="workText"
        @input="onWorkChange($event.target.value)"
        placeholder="해당 날짜의 업무 내용을 기록하세요."
      />
    </div>
  </template>
  
  <script setup>
  import { computed, ref, onBeforeUnmount } from 'vue'
  import { useWorklogStore } from '@/stores/worklog'
  
  // v-model:date 지원
  const props = defineProps({
    date: { type: String, required: true }
  })
  const emit = defineEmits(['update:date'])
  
  const worklog = useWorklogStore()
  
  // ----- 날짜 유틸 (한국시간 기준 YYYY-MM-DD) -----
  function localDateStr(d = new Date()){
    const tz = d.getTimezoneOffset()
    const kst = new Date(d.getTime() - tz * 60000)
    return kst.toISOString().slice(0,10)
  }
  function shiftDate(dateStr, delta){ // delta: ±일
    const [y,m,d] = dateStr.split('-').map(Number)
    const base = new Date(y, m-1, d)
    base.setDate(base.getDate() + delta)
    return localDateStr(base)
  }
  const prettyDate = computed(()=>{
    const [y,m,d] = props.date.split('-').map(Number)
    return `${y}.${String(m).padStart(2,'0')}.${String(d).padStart(2,'0')}`
  })
  function goPrev(){ emit('update:date', shiftDate(props.date, -1)) }
  function goNext(){ emit('update:date', shiftDate(props.date,  1)) }
  function goToday(){ emit('update:date', localDateStr()) }
  
  // ----- 업무일지 -----
  const workText = computed(() => worklog.text(props.date))
  
  // 저장 인디케이터
  const saving = ref(false)
  const saved  = ref(false)
  let debounceTimer = null
  let hideTimer = null
  
  function onWorkChange(v){
    worklog.set(props.date, v)
    saving.value = true
    saved.value = false
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      saving.value = false
      saved.value = true
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => { saved.value = false }, 1500)
    }, 400)
  }
  
  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (hideTimer) clearTimeout(hideTimer)
  })
  </script>
  
  <style scoped>
  .pill{
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-size: 12px;
    background: #fff;
  }
  .pill.ok{
    background: #ecfdf5;
    border-color: #a7f3d0;
  }
  </style>
  