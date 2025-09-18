<template>
  <section class="card" style="padding:12px;display:grid;gap:10px;">
    <h3 style="margin:0;">학생 활동 기록</h3>

    <div v-if="!roster.length" style="color:var(--muted)">명단이 없습니다. (출결 탭에서 엑셀 업로드)</div>
    <div v-else style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <select class="input" v-model="selId" style="min-width:200px;">
        <option disabled value="">학생 선택</option>
        <option v-for="s in roster" :key="s['학생개인번호']" :value="s['학생개인번호']">
          {{ s['학년'] }}-{{ s['반'] }} {{ s['번호'] }} {{ s['성명'] }}
        </option>
      </select>
      <input class="input" type="datetime-local" v-model="dt" style="max-width:220px;">
      <input class="input" v-model="content" placeholder="활동 내용" style="min-width:280px;">
      <button class="btn primary" @click="add">추가</button>
    </div>

    <table v-if="selId && list.length" style="width:100%;border-collapse:collapse;">
      <thead><tr><th class="th">일시</th><th class="th">내용</th><th class="th">작업</th></tr></thead>
      <tbody>
        <tr v-for="r in list" :key="r.id">
          <td class="td">{{ r.datetime }}</td>
          <td class="td">{{ r.content }}</td>
          <td class="td"><button class="btn" @click="remove(r.id)">삭제</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="selId" style="color:var(--muted);margin:0;">기록이 없습니다.</p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSubjectsStore } from '@/stores/subjects'
const props = defineProps({ subject: { type:String, required:true } })
const store = useSubjectsStore()

const roster = computed(()=> store.roster(props.subject))
const selId = ref('')
const content = ref('')

function nowLocal(){
  const d=new Date(), z=d.getTimezoneOffset()
  return new Date(d.getTime()-z*60000).toISOString().slice(0,16)
}
const dt = ref(nowLocal())
const list = computed(()=> selId.value ? store.actListByStudent(props.subject, selId.value) : [])

function add(){
  const c = content.value.trim()
  if (!selId.value || !c) return
  store.addActivity(props.subject, selId.value, { datetime: dt.value.replace('T',' '), content: c })
  content.value = ''
}
function remove(id){ store.removeActivity(props.subject, selId.value, id) }
</script>

<style scoped>
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; }
</style>
