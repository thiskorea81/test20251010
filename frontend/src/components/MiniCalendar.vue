<template>
    <div class="card" style="padding:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <button class="btn" @click="prevMonth">‹</button>
        <strong>{{ ymLabel }}</strong>
        <button class="btn" @click="nextMonth">›</button>
      </div>
  
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:12px;color:var(--muted);margin-bottom:4px;">
        <div v-for="w in ['일','월','화','수','목','금','토']" :key="w" style="text-align:center;">{{ w }}</div>
      </div>
  
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
        <div v-for="n in firstWeekday" :key="'pad'+n"></div>
  
        <button
          v-for="d in daysInMonth"
          :key="d"
          class="btn"
          :class="isSelected(d) ? 'primary' : ''"
          @click="choose(d)"
          style="padding:8px 0;"
        >{{ d }}</button>
      </div>
  
      <div class="mt-2" style="margin-top:8px;">
        <input type="date" class="input" v-model="model" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, watch } from 'vue'
  
  const props = defineProps({ modelValue: String })
  const emit = defineEmits(['update:modelValue'])
  
  const today = new Date()
  const y = ref(today.getFullYear())
  const m = ref(today.getMonth()) // 0-11
  
  const model = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
  })
  
  const ymLabel = computed(() => `${y.value}년 ${m.value+1}월`)
  
  const firstWeekday = computed(() => {
    const d = new Date(y.value, m.value, 1).getDay()
    return d // 0=일
  })
  
  const daysInMonth = computed(() => new Date(y.value, m.value+1, 0).getDate())
  
  function choose(day){
    const mm = String(m.value+1).padStart(2,'0')
    const dd = String(day).padStart(2,'0')
    model.value = `${y.value}-${mm}-${dd}`
  }
  
  function isSelected(day){
    if (!model.value) return false
    const [yy, mm, dd] = model.value.split('-').map(Number)
    return yy===y.value && (mm-1)===m.value && dd===day
  }
  
  function prevMonth(){ m.value===0 ? (y.value--, m.value=11) : m.value-- }
  function nextMonth(){ m.value===11 ? (y.value++, m.value=0) : m.value++ }
  
  // 날짜가 바뀌면 해당 월로 이동
  watch(model, (v)=>{
    if(!v) return
    const d = new Date(v)
    y.value = d.getFullYear()
    m.value = d.getMonth()
  }, { immediate:true })
  </script>
  