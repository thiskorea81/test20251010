<template>
    <section class="card" style="padding:16px; display:grid; gap:12px;">
      <h3 style="margin:0;">학급·교과 설정</h3>
  
      <!-- 학년/반 -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <label>학년
          <select class="input" style="width:100px; margin-left:6px" :value="grade" @change="onGrade($event.target.value)">
            <option value="">선택</option>
            <option v-for="g in [1,2,3,4,5,6]" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>
  
        <label>반
          <select class="input" style="width:120px; margin-left:6px" :value="classNo" @change="onClass($event.target.value)">
            <option value="">선택</option>
            <option v-for="c in 15" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
  
        <span v-if="hasHomeroom" class="pill ok">담임: {{ grade }}학년 {{ classNo }}반</span>
        <span v-else class="pill">담임 학급을 선택하세요</span>
      </div>
  
      <!-- 교과 -->
      <div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input class="input" style="max-width:240px" v-model="subjectText" placeholder="교과명 입력(예: 수학)" @keyup.enter="add" />
          <button class="btn" @click="add">추가</button>
        </div>
  
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <span v-for="s in subjects" :key="s" class="chip">
            {{ s }}
            <button class="chip-x" @click="remove(s)">✕</button>
          </span>
          <small v-if="!subjects.length" style="color:var(--muted)">등록된 교과가 없습니다.</small>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useSettingsStore } from '@/stores/settings'
  
  const settings = useSettingsStore()
  const subjectText = ref('')
  
  const grade = computed(() => settings.grade)
  const classNo = computed(() => settings.classNo)
  const subjects = computed(() => settings.subjects)
  const hasHomeroom = computed(() => settings.hasHomeroom)
  
  function onGrade(v){ settings.setGrade(v) }
  function onClass(v){ settings.setClassNo(v) }
  function add(){
    settings.addSubject(subjectText.value)
    subjectText.value = ''
  }
  function remove(s){ settings.removeSubject(s) }
  </script>
  
  <style scoped>
  .pill{
    padding:4px 8px; border-radius:999px; border:1px solid var(--border);
    font-size:12px; background:#fff;
  }
  .pill.ok{ background:#ecfeff; border-color:#bae6fd; }
  .chip{
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 10px; border:1px solid var(--border); border-radius:999px; background:#fff;
  }
  .chip-x{
    border:none; background:transparent; cursor:pointer; font-size:12px;
  }
  </style>
  