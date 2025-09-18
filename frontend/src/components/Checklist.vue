<template>
  <section>
    <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <h3 v-if="title" style="margin:0">{{ title }}</h3>
      <div class="card" style="padding:4px;">
        <nav style="display:flex;gap:4px;">
          <button class="btn" :class="tab==='todo' ? 'primary' : ''" @click="tab='todo'">해야할일</button>
          <button class="btn" :class="tab==='done' ? 'primary' : ''" @click="tab='done'">완료</button>
          <button class="btn" :class="tab==='all'  ? 'primary' : ''" @click="tab='all'">전체</button>
        </nav>
      </div>
    </header>

    <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <input class="input" style="flex:1;min-width:220px" v-model="q" placeholder="할 일 검색 (내용 포함)" />
      <small style="color:var(--muted)">전체 {{ items.length }} · 해야 {{ items.filter(i=>!i.done).length }} · 완료 {{ items.filter(i=>i.done).length }}</small>
    </div>

    <div v-if="tab!=='done' && allowAdd" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <FormInput
        style="flex:1;min-width:220px"
        :placeholder="placeholder"
        v-model="text"
        @enter="emitAdd"
      />
      <button class="btn primary" @click="emitAdd">추가</button>
      <button class="btn" @click="$emit('sort')">정렬(미완료 먼저)</button>
      <button class="btn" @click="$emit('clearDone')">완료 비우기</button>
    </div>

    <ul style="list-style:none;padding:0;margin-top:12px;display:grid;gap:8px;">
      <li
        v-for="item in visibleItems"
        :key="item.id"
        class="card"
        style="padding:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;"
      >
        <label style="display:flex;align-items:center;gap:8px;flex:1;">
          <input type="checkbox" :checked="item.done" @change="$emit('toggle', item.id)" />
          <span :style="item.done ? 'text-decoration:line-through;color:var(--muted);' : ''">
            {{ item.text }}
          </span>
        </label>
        <button class="btn" @click="$emit('remove', item.id)">삭제</button>
      </li>
    </ul>

    <div v-if="tab==='done' && visibleItems.length" style="margin-top:8px;display:flex;justify-content:flex-end;">
      <button class="btn" @click="$emit('clearDone')">완료 항목 비우기</button>
    </div>

    <p v-if="!visibleItems.length" style="margin-top:8px;color:var(--muted);">
      {{ emptyText }}
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import FormInput from '@/components/FormInput.vue' // 기존 다이어리에서 쓰던 입력 컴포넌트

const props = defineProps({
  title: { type: String, default: '' },
  items: { type: Array, required: true }, // [{id, text, done}]
  allowAdd: { type: Boolean, default: true },
  placeholder: { type: String, default: '할 일을 입력하세요' },
})
const emits = defineEmits(['add','toggle','remove','clearDone','sort'])

const tab = ref('todo')
const text = ref('')
const q = ref('')

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  if (!keyword) return props.items
  return props.items.filter(i => String(i.text||'').toLowerCase().includes(keyword))
})
const visibleItems = computed(() => {
  const base = filtered.value
  if (tab.value === 'todo') return base.filter(i => !i.done)
  if (tab.value === 'done') return base.filter(i =>  i.done)
  return base // all
})
const emptyText = computed(() => {
  if (tab.value === 'todo') return '등록된 할 일이 없습니다.'
  if (tab.value === 'done') return '완료된 항목이 없습니다.'
  return '아직 항목이 없습니다.'
})

function emitAdd(){
  const t = text.value.trim()
  if (!t) return
  emits('add', t)
  text.value = ''
}
</script>
