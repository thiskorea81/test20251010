<template>
    <div class="diary-grid">
      <!-- 좌: 캘린더(업무일지 날짜 연동) -->
      <section>
        <MiniCalendar v-model="date" />
      </section>
  
      <!-- 우: 전역 할 일 컴포넌트 -->
      <section>
        <TodoList />
      </section>
    </div>
  
    <!-- 하: 업무일지 컴포넌트 -->
    <section style="margin-top:16px;display:grid;gap:12px;">
        <WorklogSearch @select="(d)=>date = d" />
        <WorklogEditor v-model:date="date" />
    </section>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useDiaryStore } from '@/stores/diary'
  import MiniCalendar from '@/components/MiniCalendar.vue'
  import TodoList from '@/components/TodoList.vue'
  import WorklogEditor from '@/components/WorklogEditor.vue'
  import WorklogSearch from '@/components/WorklogSearch.vue'
  
  const diary = useDiaryStore()
  const date = computed({
    get: () => diary.selectedDate,
    set: v => diary.setDate(v),
  })
  </script>
  