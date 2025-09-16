<template>
  <div class="card" style="padding:16px;">
    <dl style="display:grid;grid-template-columns:140px 1fr;row-gap:8px;column-gap:12px;margin:0;">
      <dt class="muted">학생개인번호</dt><dd>{{ student['학생개인번호'] || '-' }}</dd>
      <dt class="muted">학년/반/번호</dt><dd>{{ student['학년'] }}학년 {{ student['반'] }}반 {{ student['번호'] }}번</dd>
      <dt class="muted">성명</dt><dd>{{ student['성명'] || student['이름'] || '-' }}</dd>
      <dt class="muted">성별</dt><dd>{{ student['성별'] || '-' }}</dd>
      <dt class="muted">생년월일</dt><dd>{{ student['생년월일'] || '-' }}</dd>
      <dt class="muted">연락처</dt><dd>{{ student['연락처'] || '-' }}</dd>
      <dt class="muted">보호자1연락처</dt><dd><span class="pill primary">{{ student['보호자1연락처'] || '-' }}</span></dd>
      <dt class="muted">보호자2연락처</dt><dd><span class="pill">{{ student['보호자2연락처'] || '-' }}</span></dd>
      <dt class="muted">주소</dt><dd>{{ student['주소'] || '-' }}</dd>
      <dt class="muted">비고</dt><dd>{{ student['비고'] || '-' }}</dd>
    </dl>

    <!-- 간단 출결 요약 -->
    <hr style="margin:12px 0;border:none;border-top:1px solid var(--border);" />
    <div style="font-size:13px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap;">
      <span>({{ monthLabel }}) 생리결석: 사용 {{ menUsedAll }} / 남은 {{ menRemainAll }}</span>
      <span>올해 체험학습(국내): 사용 {{ usedDomestic }}일 / 남은 {{ remainDomestic }}일</span>
      <span>올해 체험학습(국외): 사용 {{ usedOverseas }}일 / 남은 {{ remainOverseas }}일</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: { type: Object, required: true },
  monthLabel: { type: String, required: true },
  menUsedAll: { type: Number, required: true },
  menRemainAll: { type: Number, required: true },
  usedDomestic: { type: Number, required: true },
  remainDomestic: { type: Number, required: true },
  usedOverseas: { type: Number, required: true },
  remainOverseas: { type: Number, required: true },
})
</script>

<style scoped>
.muted { color: var(--muted); }
.pill { display:inline-block; padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:#fff; font-size:13px; }
.pill.primary { background:#f0f9ff; border-color:#bae6fd; font-weight:600; }
</style>
