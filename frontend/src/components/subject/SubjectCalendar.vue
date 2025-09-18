<template>
  <section class="card" style="padding:12px;display:grid;gap:8px;">
    <header style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <h3 style="margin:0;">수업 캘린더</h3>
      <input class="input" type="date" v-model="date">
      <input class="input" v-model="title" placeholder="메모/일정(예: 수행평가, 퀴즈)" style="min-width:240px;">
      <button class="btn primary" @click="add">추가</button>
    </header>

    <table v-if="list.length" style="width:100%;border-collapse:collapse;">
      <thead><tr><th class="th">일자</th><th class="th">내용</th><th class="th">작업</th></tr></thead>
      <tbody>
        <tr v-for="r in list" :key="r.id">
          <td class="td">{{ r.date }}</td>
          <td class="td">{{ r.title }}</td>
          <td class="td"><button class="btn" @click="remove(r.id)">삭제</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else style="color:var(--muted);margin:0;">등록된 일정이 없습니다.</p>
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
const title = ref('')
const list = computed(()=> store.calList(props.subject))

function add(){
  const t = title.value.trim(); if (!t) return
  store.addCalendar(props.subject, { date: date.value, title: t })
  title.value=''
}
function remove(id){ store.removeCalendar(props.subject, id) }
</script>

<style scoped>
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; }
</style>
