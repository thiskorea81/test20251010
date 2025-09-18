<template>
  <section class="card" style="padding:12px;display:grid;gap:8px;">
    <h3 style="margin:0;">수업정리/노트</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input class="input" type="date" v-model="date">
      <button class="btn primary" @click="add">추가</button>
    </div>
    <textarea class="input" rows="6" v-model="text" placeholder="수업 요약, 관찰사항, 다음 시간 유의사항"></textarea>

    <table v-if="list.length" style="width:100%;border-collapse:collapse;">
      <thead><tr><th class="th">일자</th><th class="th">내용</th><th class="th">작업</th></tr></thead>
      <tbody>
        <tr v-for="r in list" :key="r.id">
          <td class="td">{{ r.date }}</td>
          <td class="td"><div style="white-space:pre-wrap;">{{ r.text }}</div></td>
          <td class="td"><button class="btn" @click="remove(r.id)">삭제</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else style="color:var(--muted);margin:0;">등록된 노트가 없습니다.</p>
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
const text = ref('')

const list = computed(()=> store.lessonList(props.subject))
function add(){
  const t = text.value.trim(); if (!t) return
  store.addLesson(props.subject, { date: date.value, text: t })
  text.value=''
}
function remove(id){ store.removeLesson(props.subject, id) }
</script>

<style scoped>
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; }
</style>
