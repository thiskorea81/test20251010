<template>
  <section class="card" style="padding:12px;">
    <h3 style="margin:0 0 8px;">평가계획</h3>
    <textarea class="input" rows="12" v-model="text" @input="save"
      placeholder="예: 지필(40%), 수행(60%) / 평가 기준 / 일정 / 준비물 등"></textarea>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSubjectsStore } from '@/stores/subjects'
const props = defineProps({ subject: { type:String, required:true } })
const store = useSubjectsStore()

const text = ref(store.evalPlan[props.subject]?.text || '')
watch(()=>props.subject, s=>{
  text.value = store.evalPlan[s]?.text || ''
}, { immediate:true })

function save(){ store.setEvalPlan(props.subject, text.value) }
</script>
