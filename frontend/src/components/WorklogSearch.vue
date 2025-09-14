<template>
    <div class="card" style="padding:12px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input class="input" v-model="q" placeholder="업무일지 검색 (키워드)" />
        <small style="color:var(--muted)">결과 {{ results.length }}건</small>
      </div>
  
      <ul v-if="q" style="list-style:none;padding:0;margin-top:10px;display:grid;gap:8px;max-height:220px;overflow:auto;">
        <li v-for="r in results" :key="r.date" class="card" style="padding:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <strong>{{ r.date }}</strong>
            <button class="btn" @click="$emit('select', r.date)">이 날짜로 이동</button>
          </div>
          <p style="margin:6px 0 0;color:var(--muted);font-size:14px;">{{ r.snippet }}</p>
        </li>
      </ul>
  
      <p v-else style="margin-top:8px;color:var(--muted);font-size:14px;">
        날짜별 업무일지에서 키워드를 찾아 이동할 수 있습니다.
      </p>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
  import { useWorklogStore } from '@/stores/worklog'
  
  const emit = defineEmits(['select'])
  const q = ref('')
  const worklog = useWorklogStore()
  
  const results = computed(() => {
    const k = q.value.trim().toLowerCase()
    if (!k) return []
    const out = []
    for (const [date, text] of Object.entries(worklog.byDate)) {
      if (!text) continue
      const idx = text.toLowerCase().indexOf(k)
      if (idx >= 0) {
        const start = Math.max(0, idx - 20)
        const end = Math.min(text.length, idx + k.length + 20)
        const snippet = (start>0?'…':'') + text.slice(start, end) + (end<text.length?'…':'')
        out.push({ date, snippet })
      }
    }
    // 최신 날짜 우선 정렬
    out.sort((a,b) => a.date < b.date ? 1 : -1)
    return out
  })
  </script>
  