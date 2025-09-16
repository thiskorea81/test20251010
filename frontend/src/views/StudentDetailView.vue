<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">학생 상세</h2>
      <div style="display:flex;gap:8px;">
        <button class="btn" @click="toggleEdit" v-if="activeTab==='info'">{{ editing ? '수정 취소' : '정보 수정' }}</button>
        <RouterLink class="btn" to="/homeroom">목록으로</RouterLink>
      </div>
    </div>

    <!-- 탭 버튼 -->
    <nav style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab-btn"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- 탭 콘텐츠 -->
    <div style="margin-top:12px;">
      <!-- 기본 정보 -->
      <div v-if="activeTab==='info'">
        <div class="card" style="padding:16px;" v-if="stu">
          <!-- 보기 모드 -->
          <template v-if="!editing">
            <dl style="display:grid;grid-template-columns:140px 1fr;row-gap:8px;column-gap:12px;margin:0;">
              <dt class="muted">학번</dt><dd>{{ stu['학번'] }}</dd>
              <dt class="muted">학년/반/번호</dt>
              <dd>{{ stu['학년'] }}학년 {{ stu['반'] }}반 {{ stu['번호'] }}번</dd>
              <dt class="muted">이름</dt><dd>{{ stu['이름'] }}</dd>
              <dt class="muted">성별</dt><dd>{{ stu['성별'] }}</dd>
              <dt class="muted">연락처</dt><dd>{{ stu['연락처'] }}</dd>

              <dt class="muted">보호자1연락처</dt>
              <dd><span class="pill primary">{{ stu['보호자1연락처'] || '-' }}</span></dd>
              <dt class="muted">보호자2연락처</dt>
              <dd><span class="pill">{{ stu['보호자2연락처'] || '-' }}</span></dd>

              <dt class="muted">주소</dt><dd>{{ stu['주소'] }}</dd>
              <dt class="muted">비고</dt><dd>{{ stu['비고'] }}</dd>
            </dl>
          </template>

          <!-- 수정 모드 -->
          <template v-else>
            <form @submit.prevent="save">
              <div style="display:grid;grid-template-columns:140px 1fr;row-gap:10px;column-gap:12px;">
                <label class="muted">학번</label><div>{{ form['학번'] }}</div>
                <label class="muted">이름</label><input class="input" v-model="form['이름']" />
                <label class="muted">학년</label><input class="input" type="number" min="1" max="6" v-model.number="form['학년']" />
                <label class="muted">반</label><input class="input" type="number" min="1" max="15" v-model.number="form['반']" />
                <label class="muted">번호</label><input class="input" type="number" min="1" max="99" v-model.number="form['번호']" />
                <label class="muted">성별</label>
                <select class="input" v-model="form['성별']">
                  <option value="">선택</option><option>남</option><option>여</option>
                </select>
                <label class="muted">연락처</label><input class="input" v-model="form['연락처']" />
                <label class="muted">보호자1연락처</label><input class="input" v-model="form['보호자1연락처']" />
                <label class="muted">보호자2연락처</label><input class="input" v-model="form['보호자2연락처']" />
                <label class="muted">주소</label><input class="input" v-model="form['주소']" />
                <label class="muted">비고</label><textarea class="input" v-model="form['비고']" rows="3"></textarea>
              </div>
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
                <button class="btn" type="button" @click="toggleEdit">취소</button>
                <button class="btn primary" type="submit">저장</button>
              </div>
            </form>
          </template>
        </div>
      </div>

      <!-- 상담 -->
      <div v-if="activeTab==='counsel'">
        <StudentCounsel :hakbun="String(route.params.hakbun)" />
      </div>

      <!-- 출결 -->
      <div v-if="activeTab==='attendance'">
        <div class="card" style="padding:12px;margin-bottom:12px;">
          <h3 style="margin:0 0 8px;">출결 요약</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span class="pill ok">
              ({{ monthLabel }}) 생리결석: 결석 {{ men.absentRemain }}/1, 조퇴 {{ men.earlyRemain }}/1, 지각 {{ men.lateRemain }}/1
            </span>
            <span class="pill ok">올해 국내: 남은 {{ remainDomestic }}/7 (사용 {{ usedDomestic }})</span>
            <span class="pill ok">올해 국외: 남은 {{ remainOverseas }}/30 (사용 {{ usedOverseas }})</span>
          </div>
        </div>
        <StudentAttendance :hakbun="String(route.params.hakbun)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useAttendanceStore } from '@/stores/attendance'
import StudentCounsel from '@/components/StudentCounsel.vue'
import StudentAttendance from '@/components/StudentAttendance.vue'

const route = useRoute()
const students = useStudentsStore()
const att = useAttendanceStore()

const stu = computed(() =>
  students.list.find(s => String(s['학번']) === String(route.params.hakbun))
)

/* ====== 탭 ====== */
const tabs = [
  { key: 'info', label: '기본정보' },
  { key: 'counsel', label: '상담' },
  { key: 'attendance', label: '출결' }
]
const activeTab = ref('info')

/* ====== 편집 ====== */
const editing = ref(false)
const form = reactive({
  학번: '', 학년: null, 반: null, 번호: null, 이름: '', 성별: '',
  연락처: '', 보호자1연락처: '', 보호자2연락처: '', 주소: '', 비고: ''
})
watch(stu, s => { if (s) Object.assign(form, s) }, { immediate: true })

function toggleEdit(){ editing.value = !editing.value }
function save(){
  if (!form['이름']) return alert('이름을 입력하세요.')
  students.update(form['학번'], { ...form })
  editing.value = false
  alert('저장되었습니다.')
}

/* ====== 출결 요약 ====== */
const today = new Date()
const yyyy = String(today.getFullYear())
const yyyymm = `${yyyy}-${String(today.getMonth()+1).padStart(2,'0')}`
const monthLabel = `${yyyy}.${String(today.getMonth()+1).padStart(2,'0')}`

const usedAbsent = computed(() => att.menstrualCount(String(route.params.hakbun), yyyymm, 'absent'))
const usedEarly  = computed(() => att.menstrualCount(String(route.params.hakbun), yyyymm, 'early'))
const usedLate   = computed(() => att.menstrualCount(String(route.params.hakbun), yyyymm, 'late'))
const men = computed(() => ({
  absentRemain: Math.max(0, 1 - (usedAbsent.value || 0)),
  earlyRemain : Math.max(0, 1 - (usedEarly.value  || 0)),
  lateRemain  : Math.max(0, 1 - (usedLate.value   || 0)),
}))

const usedDomestic = computed(() => att.expDaysUsed(String(route.params.hakbun), yyyy, 'domestic'))
const usedOverseas = computed(() => att.expDaysUsed(String(route.params.hakbun), yyyy, 'overseas'))
const remainDomestic = computed(() => Math.max(0, 7  - (usedDomestic.value || 0)))
const remainOverseas = computed(() => Math.max(0, 30 - (usedOverseas.value || 0)))
</script>

<style scoped>
.muted { color: var(--muted); }
.pill {
  display:inline-block;
  padding:4px 8px;
  border:1px solid var(--border);
  border-radius:999px;
  background:#fff;
  font-size:13px;
}
.pill.primary { background:#f0f9ff; border-color:#bae6fd; font-weight:600; }
.pill.ok { background:#ecfdf5; border-color:#a7f3d0; }

.tab-btn {
  padding:6px 14px;
  border:1px solid var(--border);
  border-radius:6px;
  background:#f9fafb;
  cursor:pointer;
}
.tab-btn.active {
  background:#fff;
  border-color:#3b82f6;
  color:#1d4ed8;
  font-weight:600;
}
</style>
