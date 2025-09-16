<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">
        동아리 활동
        <small v-if="student" class="title-sub">
          {{ student['학년'] }}학년 {{ student['반'] }}반 {{ student['번호'] }}번 {{ student['성명'] }} ({{ student['학생개인번호'] }})
        </small>
      </h2>
      <RouterLink class="btn" to="/club">명단으로</RouterLink>
    </div>

    <section class="card" style="padding:12px;margin-top:12px;display:grid;gap:10px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input type="datetime-local" class="input" v-model="dt" style="max-width:220px;">
      </div>
      <textarea class="input" rows="5" v-model="content" placeholder="활동 내용을 입력하세요."></textarea>
      <div style="display:flex;gap:8px;">
        <button class="btn primary" @click="save">{{ editingId ? '수정 저장' : '저장' }}</button>
        <button class="btn" @click="reset">초기화</button>
        <button v-if="editingId" class="btn" @click="cancelEdit">편집 취소</button>
      </div>
    </section>

    <section v-if="list.length" class="card" style="padding:12px;margin-top:12px;">
      <h3 style="margin:0 0 8px;">활동 기록</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th class="th">일시</th>
            <th class="th">내용</th>
            <th class="th">작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td class="td" style="white-space:nowrap;">{{ r.datetime }}</td>
            <td class="td"><div style="white-space:pre-wrap;">{{ r.content }}</div></td>
            <td class="td" style="white-space:nowrap;">
              <button class="btn" @click="edit(r)">수정</button>
              <button class="btn" @click="remove(r.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-top:8px;">
        <button class="btn" @click="clearAll">전체 삭제</button>
      </div>
    </section>
    <p v-else class="card" style="padding:12px;margin-top:12px;color:var(--muted);">아직 활동 기록이 없습니다.</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useClubActivityStore } from '@/stores/clubActivity'

const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const students = useStudentsStore()
const acts = useClubActivityStore()

const student = computed(() => students.list.find(s => String(s['학생개인번호']) === id.value))

/* KST now for datetime-local */
function kstNowInput(){
  const d = new Date()
  const z = d.getTimezoneOffset()
  return new Date(d.getTime() - z*60000).toISOString().slice(0,16)
}

const dt = ref(kstNowInput())
const content = ref('')
const editingId = ref(null)
const list = computed(() => acts.listById(id.value))

function save(){
  const c = content.value.trim()
  if (!c) return
  const dtValue = dt.value.replace('T',' ')
  if (editingId.value){
    acts.update(id.value, editingId.value, { datetime: dtValue, content: c })
  } else {
    acts.add(id.value, dtValue, c)
  }
  reset()
}
function edit(r){
  editingId.value = r.id
  dt.value = r.datetime.replace(' ','T')
  content.value = r.content
}
function remove(rid){
  if (!confirm('삭제할까요?')) return
  acts.remove(id.value, rid)
}
function clearAll(){
  if (!confirm('모든 활동 기록을 삭제할까요?')) return
  acts.clearAll(id.value)
}
function reset(){
  editingId.value = null
  dt.value = kstNowInput()
  content.value = ''
}
function cancelEdit(){ reset() }
</script>

<style scoped>
.th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
.title-sub { margin-left:8px; color:var(--muted); font-weight:600; }
</style>
