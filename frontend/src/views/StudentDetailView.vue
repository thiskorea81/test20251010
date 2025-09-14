<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">학생 정보</h2>
      <div style="display:flex;gap:8px;">
        <RouterLink class="btn" to="/homeroom">목록으로</RouterLink>
      </div>
    </div>

    <div class="card" style="padding:16px;margin-top:12px;" v-if="stu">
      <dl style="display:grid;grid-template-columns:140px 1fr;row-gap:8px;column-gap:12px;margin:0;">
        <dt class="muted">학번</dt><dd>{{ stu['학번'] }}</dd>
        <dt class="muted">학년/반/번호</dt><dd>{{ stu['학년'] }}학년 {{ stu['반'] }}반 {{ stu['번호'] }}번</dd>
        <dt class="muted">이름</dt><dd>{{ stu['이름'] }}</dd>
        <dt class="muted">성별</dt><dd>{{ stu['성별'] }}</dd>
        <dt class="muted">연락처</dt><dd>{{ stu['연락처'] }}</dd>

        <!-- ✅ 보호자 연락처 (1 강조) -->
        <dt class="muted">보호자1연락처</dt>
        <dd>
          <span class="pill primary">{{ stu['보호자1연락처'] || '-' }}</span>
        </dd>
        <dt class="muted">보호자2연락처</dt>
        <dd>
          <span class="pill">{{ stu['보호자2연락처'] || '-' }}</span>
        </dd>

        <dt class="muted">주소</dt><dd>{{ stu['주소'] }}</dd>
        <dt class="muted">비고</dt><dd>{{ stu['비고'] }}</dd>
      </dl>
    </div>

    <div v-else class="card" style="padding:16px;margin-top:12px;">
      <p>해당 학생을 찾을 수 없습니다.</p>
      <RouterLink class="btn" to="/homeroom">목록으로</RouterLink>
    </div>

    <!-- 상담 기록 (파일첨부/태그/인쇄 포함 버전) -->
    <div style="margin-top:12px;">
      <StudentCounsel :hakbun="String(route.params.hakbun)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import StudentCounsel from '@/components/StudentCounsel.vue'

const route = useRoute()
const students = useStudentsStore()

const stu = computed(() =>
  students.list.find(s => String(s['학번']) === String(route.params.hakbun))
)
</script>

<style scoped>
.muted { color: var(--muted); }

/* 연락처 뱃지 */
.pill{
  display:inline-block;
  padding:4px 8px;
  border:1px solid var(--border);
  border-radius:999px;
  background:#fff;
  font-size:13px;
}
.pill.primary{
  background:#f0f9ff;
  border-color:#bae6fd;
  font-weight:600;
}
</style>
