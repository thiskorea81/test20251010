<template>
  <section class="card" style="padding:12px;display:grid;gap:8px;">
    <h3 style="margin:0;">진도표</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input class="input" type="date" v-model="date">
      <input class="input" v-model="unit" placeholder="단원/차시" style="min-width:200px;">
      <input class="input" v-model="memo" placeholder="메모(선택)" style="min-width:260px;">
      <button class="btn primary" @click="add">추가</button>
    </div>

    <table v-if="list.length" style="width:100%;border-collapse:collapse;">
      <thead><tr><th class="th">일자</th><th class="th">단원/차시</th><th class="th">메모</th><th class="th">작업</th></tr></thead>
      <tbody>
        <tr v-for="r in list" :key="r.id">
          <td class="td">{{ r.date }}</td>
          <td class="td">{{ r.unit }}</td>
          <td class="td">{{ r.memo }}</td>
          <td class="td"><button class="btn" @click="remove(r.id)">삭제</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else style="color:var(--muted);margin:0;">등록된 진도 기록이 없습니다.</p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSubjectsStore } from '@/stores/subjects'
const props = defineProps({ subject: { type:String, required:true } })
const store = useSubjectsStore()

function today(){
  const d=new Date(), z=d.getTimezoneOffset()
  return new Date(d.getTime()-z*60000).toISOString().slice(0,10)
}
const date = ref(today())
const unit = ref('')
const memo = ref('')

const list = computed(()=> store.progressList(props.subject))
function add(){
  const u = unit.value.trim(); if (!u) return
  store.addProgress(props.subject, { date: date.value, unit: u, memo: memo.value.trim() })
  unit.value=''; memo.value=''
}
function remove(id){ store.removeProgress(props.subject, id) }
</script>

<style scoped>
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; }
</style>
