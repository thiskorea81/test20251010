<template>
  <section class="card" style="padding:16px; display:grid; gap:12px;">
    <h3 style="margin:0;">학급·교과 설정</h3>

    <!-- 학년/반 -->
    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
      <label>학년
        <select
          class="input"
          style="width:100px; margin-left:6px"
          :value="grade"
          @change="onGrade(($event.target as HTMLSelectElement).value)"
        >
          <option value="">선택</option>
          <option v-for="g in [1,2,3,4,5,6]" :key="g" :value="g">{{ g }}</option>
        </select>
      </label>

      <label>반
        <select
          class="input"
          style="width:120px; margin-left:6px"
          :value="classNo"
          @change="onClass(($event.target as HTMLSelectElement).value)"
        >
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
        <input
          class="input"
          style="max-width:240px"
          v-model="subjectText"
          placeholder="교과명 입력(예: 수학)"
          @keyup.enter="addSubject"
        />
        <button class="btn" @click="addSubject">추가</button>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
        <span v-for="s in subjects" :key="s" class="chip">
          {{ s }}
          <button class="chip-x" @click="removeSubject(s)">✕</button>
        </span>
        <small v-if="!subjects.length" style="color:var(--muted)">등록된 교과가 없습니다.</small>
      </div>
    </div>
  </section>

  <!-- 업무 -->
  <section class="card" style="padding:12px;display:grid;gap:8px; margin-top:12px;">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h3 style="margin:0;">업무</h3>
      <small v-if="savedAtText" style="color:var(--muted)">{{ savedAtText }}</small>
    </header>

    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input
        class="input"
        v-model="workName"
        placeholder="업무명(예: 학예회, 방과후)"
        style="min-width:240px;"
        @keyup.enter="addWork"
      >
      <button class="btn primary" @click="addWork">추가</button>
    </div>

    <ul v-if="works.length" style="list-style:none;padding:0;margin:0;display:grid;gap:6px;">
      <li
        v-for="w in works"
        :key="w"
        class="card"
        style="padding:8px;display:flex;justify-content:space-between;align-items:center;"
      >
        <span>{{ w }}</span>
        <button class="btn" @click="removeWork(w)">삭제</button>
      </li>
    </ul>
    <p v-else style="color:var(--muted);margin:0;">등록된 업무가 없습니다.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

onMounted(() => {
  // 로컬 저장된 설정 복원
  settings.init?.()
})

/* 담임 */
const grade = computed(() => settings.grade)
const classNo = computed(() => settings.classNo)
const hasHomeroom = computed(() => settings.hasHomeroom)
function onGrade(v: string){ settings.setGrade(v) }
function onClass(v: string){ settings.setClassNo(v) }

/* 교과 */
const subjectText = ref('')
const subjects = computed(() => settings.subjects)
function addSubject(){
  const t = subjectText.value.trim()
  if (!t) return
  settings.addSubject(t)
  subjectText.value = ''
}
function removeSubject(s: string){ settings.removeSubject(s) }

/* 업무 */
const workName = ref('')
const works = computed(() => settings.works || [])
const savedAtText = computed(()=>{
  if (!settings.savedAt) return ''
  const d = new Date(settings.savedAt)
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0')
  const hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})
function addWork(){
  const t = workName.value.trim()
  if (!t) return
  settings.addWork(t)
  workName.value = ''
}
function removeWork(name: string){ settings.removeWork(name) }
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
