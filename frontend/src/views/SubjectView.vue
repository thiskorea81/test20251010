<template>
    <h2 style="margin:0 0 8px">교과</h2>
    <div class="card" style="padding:12px;">
      <p v-if="!subjects.length" style="color:var(--muted)">관리자 페이지에서 교과를 추가하세요.</p>
      <ul v-else style="margin:0; padding-left:18px;">
        <li v-for="s in subjects" :key="s">{{ s }}</li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useSettingsStore } from '@/stores/settings'
  const settings = useSettingsStore()
  const subjects = computed(() => settings.subjects)
  </script>
  