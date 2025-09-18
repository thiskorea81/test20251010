<template>
  <section class="card" style="padding:12px;display:grid;gap:10px;">
    <h3 style="margin:0;">학생별 특이사항</h3>

    <div v-if="!roster.length" style="color:var(--muted)">명단이 없습니다. (출결 탭에서 엑셀 업로드)</div>

    <div v-else style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <select class="input" v-model="selId" style="min-width:240px;">
        <option disabled value="">학생 선택</option>
        <option v-for="s in roster" :key="s['학생개인번호']" :value="s['학생개인번호']">
          {{ s['학년'] }}-{{ s['반'] }} {{ s['번호'] }} {{ s['성명'] }}
        </option>
      </select>
    </div>

    <div v-if="selId" class="card" style="padding:10px;display:grid;gap:8px;">
      <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
        <label>학습 태도
          <input class="input" v-model="form.attitude" placeholder="예: 성실/보통/부족 등">
        </label>
        <label>발표
          <input class="input" v-model="form.presentation" placeholder="예: 적극적/보통/소극적">
        </label>
        <label>참여도
          <input class="input" v-model="form.participation" placeholder="예: 높음/보통/낮음">
        </label>
      </div>
      <textarea class="input" rows="4" v-model="form.memo" placeholder="기타 메모"></textarea>
      <div><button class="btn primary" @click="save">저장</button></div>
    </div>

    <p v-else style="color:var(--muted);margin:0;">학생을 선택하세요.</p>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSubjectsStore } from '@/stores/subjects'
const props = defineProps({ subject: { type:String, required:true } })
const store = useSubjectsStore()

const roster = computed(()=> store.roster(props.subject))
const selId = ref('')

const form = ref({ attitude:'', presentation:'', participation:'', memo:'' })

watch(selId, id=>{
  if (!id) return
  form.value = { ...store.studentNote(props.subject, id) }
})

function save(){
  if (!selId.value) return
  store.setStudentNote(props.subject, selId.value, form.value)
  alert('저장되었습니다.')
}
</script>
