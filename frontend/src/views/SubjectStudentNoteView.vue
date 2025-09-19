<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">
        특이사항 기록
        <small v-if="student" style="margin-left:8px;color:var(--muted);font-weight:600;">
          {{ subject }} · {{ student['학년'] }}학년 {{ student['반'] }}반 {{ student['번호'] }}번 {{ student['성명'] }}
        </small>
      </h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <BtnLink :to="{ name: 'subject' }">교과로</BtnLink>
      </div>
    </div>

    <!-- 입력 영역 -->
    <section class="card" style="padding:12px;display:grid;gap:10px;margin-top:12px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input class="input" type="datetime-local" v-model="dt" style="max-width:220px;">
        <small style="color:var(--muted)">일시를 선택하고 내용을 입력하세요.</small>
      </div>

      <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));">
        <input class="input" v-model="attitude" placeholder="태도 예: 수업태도 양호" />
        <input class="input" v-model="presentation" placeholder="발표 예: 발표 적극적" />
        <input class="input" v-model="participation" placeholder="참여 예: 모둠활동 주도" />
      </div>

      <textarea class="input" rows="3" v-model="memo" placeholder="기타 메모"></textarea>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn primary" @click="save">{{ editingId ? '수정 저장' : '저장' }}</button>
        <button class="btn" @click="resetForm">초기화</button>
        <button v-if="editingId" class="btn" @click="cancelEdit">편집 취소</button>
      </div>
    </section>

    <!-- 목록 -->
    <section class="card" style="padding:12px;display:grid;gap:8px;margin-top:12px;">
      <h3 style="margin:0 0 4px;">기록 목록</h3>
      <table v-if="list.length" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th class="th">일시</th>
            <th class="th">태도</th>
            <th class="th">발표</th>
            <th class="th">참여</th>
            <th class="th">메모</th>
            <th class="th">작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td class="td" style="white-space:nowrap;">{{ r.datetime }}</td>
            <td class="td">{{ r.attitude }}</td>
            <td class="td">{{ r.presentation }}</td>
            <td class="td">{{ r.participation }}</td>
            <td class="td" style="white-space:pre-wrap;">{{ r.memo }}</td>
            <td class="td" style="white-space:nowrap;">
              <button class="btn" @click="edit(r)">수정</button>
              <button class="btn" @click="del(r.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else style="margin:0;color:var(--muted);">아직 기록이 없습니다.</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubjectsStore } from '@/stores/subjects'
import BtnLink from '@/components/BtnLink.vue'

const route = useRoute()
const subject = computed(()=> String(route.params.subject||''))   // 과목명
const studentId = computed(()=> String(route.params.id||''))      // 학생개인번호

const store = useSubjectsStore()
onMounted(()=> store.init?.())

// 학생 표시용 정보 (명단에서 찾아 표시)
const student = computed(()=>{
  const roster = store.roster(subject.value) || []
  return roster.find(s => String(s['학생개인번호'])===studentId.value) || null
})

// 목록
const list = computed(()=> store.listNotes(subject.value, studentId.value))

// 폼
function kstNowLocal(){
  const d=new Date(), z=d.getTimezoneOffset()
  return new Date(d.getTime()-z*60000).toISOString().slice(0,16)
}
const dt = ref(kstNowLocal())
const attitude = ref('')
const presentation = ref('')
const participation = ref('')
const memo = ref('')
const editingId = ref(null)

function resetForm(){
  dt.value = kstNowLocal()
  attitude.value = ''
  presentation.value = ''
  participation.value = ''
  memo.value = ''
  editingId.value = null
}
function cancelEdit(){ resetForm() }

function save(){
  const payload = {
    datetime: dt.value.replace('T',' '),
    attitude: attitude.value.trim(),
    presentation: presentation.value.trim(),
    participation: participation.value.trim(),
    memo: memo.value.trim(),
  }
  if (!payload.datetime) return
  if (editingId.value){
    store.updateNote(subject.value, studentId.value, editingId.value, payload)
  } else {
    store.addNote(subject.value, studentId.value, payload)
  }
  resetForm()
}
function edit(r){
  editingId.value = r.id
  dt.value = r.datetime.replace(' ','T')
  attitude.value = r.attitude || ''
  presentation.value = r.presentation || ''
  participation.value = r.participation || ''
  memo.value = r.memo || ''
}
function del(id){
  if (!confirm('삭제할까요?')) return
  store.removeNote(subject.value, studentId.value, id)
}
</script>

<style scoped>
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
</style>
