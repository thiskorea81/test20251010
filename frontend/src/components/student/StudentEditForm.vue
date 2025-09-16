<template>
  <form @submit.prevent="onSave">
    <div style="display:grid;grid-template-columns:140px 1fr;row-gap:10px;column-gap:12px;">
      <label class="muted">학생개인번호</label><div>{{ form['학생개인번호'] }}</div>
      <label class="muted">성명</label><input class="input" v-model="form['성명']" />
      <label class="muted">학년</label><input class="input" type="number" min="1" max="6" v-model.number="form['학년']" />
      <label class="muted">반</label><input class="input" type="number" min="1" max="15" v-model.number="form['반']" />
      <label class="muted">번호</label><input class="input" type="number" min="1" max="99" v-model.number="form['번호']" />
      <label class="muted">성별</label>
      <select class="input" v-model="form['성별']"><option value="">선택</option><option>남</option><option>여</option></select>
      <label class="muted">생년월일</label><input class="input" v-model="form['생년월일']" placeholder="YYYY-MM-DD" />
      <label class="muted">연락처</label><input class="input" v-model="form['연락처']" />
      <label class="muted">보호자1연락처</label><input class="input" v-model="form['보호자1연락처']" />
      <label class="muted">보호자2연락처</label><input class="input" v-model="form['보호자2연락처']" />
      <label class="muted">주소</label><input class="input" v-model="form['주소']" />
      <label class="muted">비고</label><textarea class="input" v-model="form['비고']" rows="3"></textarea>
    </div>

    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
      <button class="btn" type="button" @click="$emit('cancel')">취소</button>
      <button class="btn primary" type="submit">저장</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initial: { type: Object, required: true }
})
const emit = defineEmits(['save','cancel'])

const form = reactive({
  학생개인번호:'', 학년:null, 반:null, 번호:null, 성명:'', 성별:'', 생년월일:'',
  연락처:'', 보호자1연락처:'', 보호자2연락처:'', 주소:'', 비고:''
})

// 초기값 반영
watch(() => props.initial, (v) => { Object.assign(form, v) }, { immediate: true, deep: true })

function onSave(){
  if (!form['성명']) return alert('성명을 입력하세요.')
  emit('save', { ...form })
}
</script>

<style scoped>
.muted { color: var(--muted); }
</style>
