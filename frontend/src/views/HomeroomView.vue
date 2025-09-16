<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0 0 8px">담임학급</h2>
      <RouterLink class="btn" to="/admin">설정으로 가기</RouterLink>
    </div>

    <div class="card" style="padding:12px;">
      <!-- 상단 안내/검색 -->
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
        <input class="input" v-model="q" placeholder="이름/학번 검색" style="max-width:320px;">
        <small style="color:var(--muted)">
          {{
            settings.hasHomeroom
              ? `${settings.grade}학년 ${settings.classNo}반`
              : '담임 학급 미설정'
          }}
          · 총 {{ filtered.length }}명
        </small>
      </div>

      <p v-if="!students.list.length" style="margin:8px 0;color:var(--muted);">
        업로드된 학생이 없습니다. 관리자 페이지에서 CSV/TSV를 업로드하세요.
      </p>
      <p v-else-if="settings.hasHomeroom && !scoped.length" style="margin:8px 0;color:var(--muted);">
        설정된 학급({{ settings.grade }}학년 {{ settings.classNo }}반)에 학생이 없습니다.
      </p>

      <!-- 명단 테이블 -->
      <table v-if="filtered.length" style="width:100%;border-collapse:collapse;">
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
            <!-- ✅ 성별 표준화 표시 -->
            <td class="td">{{ normalizeGender(s['성별']) || '-' }}</td>
            <td class="td">{{ s['연락처'] }}</td>
            <td class="td">
              <button class="btn" @click="goDetail(s['학번'])">보기</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else style="margin-top:8px;color:var(--muted);">표시할 학생이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useSettingsStore } from '@/stores/settings'
import { normalizeGender } from '@/utils/gender'

const router = useRouter()
const students = useStudentsStore()
const settings = useSettingsStore()

const q = ref('')

// 담임 설정 적용된 범위
const scoped = computed(() => {
  if (!settings.hasHomeroom) return students.list
  return students.list.filter(s =>
    Number(s['학년']) === Number(settings.grade) &&
    Number(s['반']) === Number(settings.classNo)
  )
})

// 검색 필터
const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  const base = scoped.value
  if (!k) return base
  return base.filter(s =>
    String(s['학번']).toLowerCase().includes(k) ||
    String(s['이름']).toLowerCase().includes(k)
  )
})

// 상세 이동
function goDetail(hakbun) {
  router.push({ name: 'student-detail', params: { hakbun } })
}
</script>

<style scoped>
.th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; }
</style>
