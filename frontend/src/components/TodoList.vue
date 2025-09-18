<template>
    <section>
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <h2 style="margin:0">할 일</h2>
        <div class="card" style="padding:4px;">
          <nav style="display:flex;gap:4px;">
            <button class="btn" :class="tab==='todo' ? 'primary' : ''" @click="tab='todo'">📌해야할일</button>
            <button class="btn" :class="tab==='done' ? 'primary' : ''" @click="tab='done'">✅완료</button>
            <button class="btn" :class="tab==='all'  ? 'primary' : ''" @click="tab='all'">📂전체</button>
          </nav>
        </div>
      </header>

      <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input class="input" style="flex:1;min-width:220px"
               v-model="q" placeholder="✨할 일 검색 (내용 포함)" />
        <small style="color:var(--muted)">전체 {{ diary.items.length }} ·
            해야 {{ diary.items.filter(i=>!i.done).length }} ·
            완료 {{ diary.items.filter(i=>i.done).length }}</small>
      </div>
  
      <div v-if="tab!=='done'" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <FormInput
          style="flex:1;min-width:220px"
          placeholder="📋할 일을 입력하세요"
          v-model="text"
          @enter="add"
        />
        <button class="btn primary" @click="add">추가</button>
      </div>
  
      <!-- 목록 -->
      <ul style="list-style:none;padding:0;margin-top:12px;display:grid;gap:8px;">
        <li
          v-for="item in visibleItems"
          :key="item.id"
          class="card"
          style="padding:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;"
        >
          <label style="display:flex;align-items:center;gap:8px;flex:1;">
            <input type="checkbox" v-model="item.done" />
            <span :style="item.done ? 'text-decoration:line-through;color:var(--muted);' : ''">
              {{ item.text }}
            </span>
          </label>
          <button class="btn" @click="remove(item.id)">삭제</button>
        </li>
      </ul>
  
      <div v-if="tab==='done' && visibleItems.length" style="margin-top:8px;display:flex;justify-content:flex-end;">
        <button class="btn" @click="clearDone">완료 항목 비우기</button>
      </div>
  
      <p v-if="!visibleItems.length" style="margin-top:8px;color:var(--muted);">
        {{ emptyText }}
      </p>
    </section>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
  import { useDiaryStore } from '@/stores/diary'
  import FormInput from '@/components/FormInput.vue'
  
  const diary = useDiaryStore()
  const tab = ref('todo') // 기본 탭은 전체
  const text = ref('')
  const q = ref('')
  
  const filtered = computed(() => {
    const keyword = q.value.trim().toLowerCase()
    if (!keyword) return diary.items
    return diary.items.filter(i => i.text.toLowerCase().includes(keyword))
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
  
  function add() {
    if (!text.value.trim()) return
    diary.add(text.value)
    text.value = ''
  }
  function remove(id) { diary.remove(id) }
  function clearDone() { diary.clearDone() }
  </script>
  