<template>
  <section class="card" style="padding:12px; display:grid; gap:12px;">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h3 style="margin:0;">상담 기록</h3>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <small style="color:var(--muted)">학생: {{ studentLabel }}</small>
        <button class="btn" @click="printPage">인쇄</button>
      </div>
    </header>

    <!-- 입력 영역 -->
    <div class="card" style="padding:10px; display:grid; gap:8px;">
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <input class="input" type="datetime-local" v-model="dt" style="max-width:220px;" />
        <input
          class="input"
          v-model="tagText"
          placeholder="태그 입력(쉼표/엔터)"
          style="max-width:280px;"
          @keydown.enter.prevent="commitTag"
          @keydown="maybeCommitComma"
        />
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <span v-for="t in tags" :key="'t-'+t" class="chip">
            {{ t }} <button class="chip-x" @click="removeTag(t)">✕</button>
          </span>
        </div>
      </div>

      <textarea class="input" v-model="text" rows="4" placeholder="상담 내용을 입력하세요."></textarea>

      <!-- 첨부: 이미지/PDF -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <button class="btn" @click="pickFiles">파일 첨부</button>
        <input ref="fileEl" type="file" accept="image/*,application/pdf" multiple @change="onFiles" style="display:none" />
        <small style="color:var(--muted)">이미지/PDF 지원 · 브라우저 저장 한도 내</small>
      </div>

      <!-- 첨부 미리보기 -->
      <div v-if="files.length" style="display:flex;gap:8px;flex-wrap:wrap;">
        <div v-for="f in files" :key="f.id" class="card" style="padding:8px;">
          <div v-if="f.type.startsWith('image/')">
            <img :src="f.dataUrl" :alt="f.name" style="width:120px;max-height:120px;object-fit:cover;border-radius:8px;" />
          </div>
          <div v-else>
            <span style="font-size:14px;">📄 {{ f.name }}</span>
          </div>
          <div style="margin-top:6px;display:flex;justify-content:space-between;gap:8px;">
            <a :href="f.dataUrl" :download="f.name" class="btn">다운로드</a>
            <button class="btn" @click="removeFile(f.id)">삭제</button>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn primary" @click="save">{{ editingId ? '수정 저장' : '저장' }}</button>
        <button class="btn" @click="resetForm">초기화</button>
        <button v-if="editingId" class="btn" @click="cancelEdit">편집 취소</button>
      </div>
    </div>

    <!-- 목록 -->
    <div v-if="list.length" id="print-area">
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th class="th">일시</th>
            <th class="th">태그</th>
            <th class="th">내용 / 첨부</th>
            <th class="th no-print">작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td class="td" style="white-space:nowrap;">{{ r.datetime }}</td>
            <td class="td" style="min-width:140px;">
              <span v-for="t in r.tags" :key="r.id+'-'+t" class="chip" style="margin-right:6px;">{{ t }}</span>
            </td>
            <td class="td">
              <div style="white-space:pre-wrap;">{{ r.content }}</div>
              <div v-if="r.files?.length" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                <div v-for="f in r.files" :key="f.id" class="card" style="padding:6px;">
                  <template v-if="f.type.startsWith('image/')">
                    <img :src="f.dataUrl" :alt="f.name" style="width:100px;max-height:100px;object-fit:cover;border-radius:6px;" />
                  </template>
                  <template v-else>
                    <span style="font-size:13px;">📄 {{ f.name }}</span>
                  </template>
                </div>
              </div>
            </td>
            <td class="td no-print" style="white-space:nowrap;">
              <button class="btn" @click="edit(r)">수정</button>
              <button class="btn" @click="del(r.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="no-print" style="display:flex;justify-content:flex-end;margin-top:8px;">
        <button class="btn" @click="clearAllConfirm">전체 삭제</button>
      </div>
    </div>
    <p v-else style="color:var(--muted)">아직 상담 기록이 없습니다.</p>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useCounselStore } from '@/stores/counsel'
import { useStudentsStore } from '@/stores/students'

// props: 학생 식별자 (학생개인번호 혹은 레거시 학번)
const props = defineProps({ hakbun: { type: [String, Number], required: true } })
const counsel = useCounselStore()
const students = useStudentsStore()

/* ===== 학생 조회 & 라벨 ===== */
// 학생 찾기: 학생개인번호 우선, 없으면 학번으로도 매칭
const student = computed(() => {
  const id = String(props.hakbun)
  return students.list.find(s =>
    String(s['학생개인번호'] || '') === id ||
    String(s['학번'] || '') === id
  )
})

// 실제 저장/조회에 사용할 효과적 키: 가능하면 학생개인번호, 없으면 전달값
const effectiveId = computed(() => {
  const s = student.value
  return s?.['학생개인번호'] ? String(s['학생개인번호']) : String(props.hakbun)
})

// 학생 라벨(성명/이름 + 학생개인번호(또는 전달값))
const studentLabel = computed(() => {
  const s = student.value
  if (!s) return String(props.hakbun)
  const name = s['성명'] || s['이름'] || ''
  const id = s['학생개인번호'] || s['학번'] || String(props.hakbun)
  return `${name} (${id})`
})

/* ===== 시간 기본값(KST) ===== */
function kstInputNow() {
  const d = new Date()
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().slice(0,16) // datetime-local
}

/* ===== 폼 상태 ===== */
const text = ref('')
const dt = ref(kstInputNow())
const tags = ref([])          // 현재 폼의 태그
const tagText = ref('')
const files = ref([])         // {id,name,type,dataUrl}[]
const editingId = ref(null)

/* ===== 목록 ===== */
const list = computed(() => counsel.listById(effectiveId.value))

/* ===== 태그 ===== */
function commitTag() {
  const raw = tagText.value.split(',').map(s => s.trim()).filter(Boolean)
  raw.forEach(t => { if (!tags.value.includes(t)) tags.value.push(t) })
  tagText.value = ''
}
function removeTag(t) { tags.value = tags.value.filter(x => x !== t) }
function maybeCommitComma(e){
  if (e.key === ',' || e.code === 'Comma') {
    e.preventDefault()
    commitTag()
  }
}

/* ===== 파일 첨부 ===== */
const fileEl = ref(null)
function pickFiles() { fileEl.value?.click() }
function onFiles(e) {
  const fl = Array.from(e.target.files || [])
  const readers = fl.map(f => new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onerror = () => reject(new Error('read fail'))
    r.onload = () => resolve({ id: Date.now() + Math.random(), name: f.name, type: f.type, dataUrl: r.result })
    r.readAsDataURL(f)
  }))
  Promise.all(readers).then(arr => { files.value.push(...arr) }).finally(() => { e.target.value = '' })
}
function removeFile(id) { files.value = files.value.filter(f => f.id !== id) }

/* ===== 저장/수정/삭제 ===== */
function save() {
  const content = text.value.trim()
  if (!content) return
  const dtValue = dt.value.replace('T', ' ')
  if (editingId.value) {
    counsel.update(effectiveId.value, editingId.value, {
      content, datetime: dtValue, tags: [...tags.value], files: [...files.value]
    })
  } else {
    counsel.add(effectiveId.value, content, dtValue, [...tags.value], [...files.value])
  }
  resetForm()
}
function edit(rec) {
  editingId.value = rec.id
  text.value = rec.content
  dt.value = rec.datetime.replace(' ', 'T')
  tags.value = [...(rec.tags || [])]
  files.value = [...(rec.files || [])]
}
function del(id) {
  if (!confirm('삭제할까요?')) return
  counsel.remove(effectiveId.value, id)
}
function clearAllConfirm() {
  if (!confirm('해당 학생의 모든 상담 기록을 삭제할까요?')) return
  counsel.clearAll(effectiveId.value)
}
function resetForm() {
  editingId.value = null
  text.value = ''
  dt.value = kstInputNow()
  tags.value = []
  tagText.value = ''
  files.value = []
}
function cancelEdit() { resetForm() }

/* 학생 식별자 변경 시 폼 리셋 */
watch(() => props.hakbun, resetForm)

/* 인쇄 */
function printPage() { window.print() }
</script>

<style scoped>
.th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
.chip{
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:#fff; font-size:12px;
}
.chip-x{ border:none; background:transparent; cursor:pointer; font-size:12px; }
@media print {
  .no-print, .no-print * { display: none !important; }
  :host, :root, body { background: #fff; }
  #print-area { box-shadow: none !important; }
  img { page-break-inside: avoid; }
}
</style>
