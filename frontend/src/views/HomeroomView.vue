<template>
    <h2 style="margin:0 0 8px">담임학급</h2>
  
    <div class="card" style="padding:12px;">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
        <input class="input" v-model="q" placeholder="이름/학번 검색" style="max-width:320px;">
        <small style="color:var(--muted)">총 {{ filtered.length }}명</small>
      </div>
  
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th class="th">학번</th>
            <th class="th">학년</th>
            <th class="th">반</th>
            <th class="th">번호</th>
            <th class="th">이름</th>
            <th class="th">성별</th>
            <th class="th">연락처</th>
            <th class="th">자세히</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s['학번']">
            <td class="td">{{ s['학번'] }}</td>
            <td class="td">{{ s['학년'] }}</td>
            <td class="td">{{ s['반'] }}</td>
            <td class="td">{{ s['번호'] }}</td>
            <td class="td">{{ s['이름'] }}</td>
            <td class="td">{{ s['성별'] }}</td>
            <td class="td">{{ s['연락처'] }}</td>
            <td class="td">
              <RouterLink class="btn" :to="{ name:'student-detail', params:{ hakbun: s['학번'] } }">보기</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
  
      <p v-if="!students.list.length" style="margin-top:8px;color:var(--muted);">
        업로드된 학생이 없습니다. 관리자 페이지에서 CSV를 업로드하세요.
      </p>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
  import { useStudentsStore } from '@/stores/students'
  
  const students = useStudentsStore()
  const q = ref('')
  
  const filtered = computed(() => {
    const k = q.value.trim().toLowerCase()
    if (!k) return students.list
    return students.list.filter(s =>
      String(s['학번']).toLowerCase().includes(k) ||
      String(s['이름']).toLowerCase().includes(k)
    )
  })
  </script>
  
  <style scoped>
  .th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; }
  </style>
  