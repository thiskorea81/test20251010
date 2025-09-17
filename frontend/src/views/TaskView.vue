<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">업무</h2>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <BtnLink :to="'/admin'">관리자 설정</BtnLink>
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
      </div>
    </div>

    <!-- 관리자에 업무가 없을 때 안내 -->
    <div v-if="!workNames.length" class="card" style="padding:12px;margin-top:12px;">
      <p style="margin:0;">관리자의 <b>업무</b>가 설정되어 있지 않습니다. 관리자 페이지에서 업무를 추가하세요.</p>
    </div>

    <!-- 업무 탭 -->
    <nav v-else style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;">
      <button v-for="w in workNames" :key="w"
              class="tab-btn" :class="{active: w===active}"
              @click="active = w">
        {{ w }}
      </button>
    </nav>

    <!-- 선택된 업무 -->
    <section v-if="active" class="card" style="padding:12px;margin-top:12px;display:grid;gap:12px;">
      <!-- 서브 탭 -->
      <nav style="display:flex;gap:8px;flex-wrap:wrap;">
        <button v-for="t in subTabs" :key="t.key"
                class="tab-btn" :class="{active: t.key===sub}"
                @click="sub=t.key">
          {{ t.label }}
        </button>
      </nav>

      <!-- 1) 업무일지 -->
      <div v-if="sub==='log'" class="card" style="padding:10px;display:grid;gap:8px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <input class="input" type="datetime-local" v-model="logDt" style="max-width:220px;">
          <input class="input" v-model="tagText" placeholder="태그(쉼표/엔터)" style="max-width:260px;"
                 @keydown.enter.prevent="commitTag" @keydown="maybeCommitComma">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span v-for="t in tags" :key="'t-'+t" class="chip">{{ t }} <button class="chip-x" @click="removeTag(t)">✕</button></span>
          </div>
        </div>
        <textarea class="input" v-model="logText" rows="4" placeholder="업무 일지 내용을 입력하세요."></textarea>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn" @click="pickFiles">파일 첨부</button>
          <input ref="fileEl" type="file" multiple accept="image/*,application/pdf" @change="onFiles" style="display:none">
          <small style="color:var(--muted)">이미지/PDF 지원 · 브라우저 저장 한도 내</small>
        </div>
        <div v-if="files.length" style="display:flex;gap:8px;flex-wrap:wrap;">
          <div v-for="f in files" :key="f.id" class="card" style="padding:8px;">
            <template v-if="f.type.startsWith('image/')">
              <img :src="f.dataUrl" :alt="f.name" style="width:120px;max-height:120px;object-fit:cover;border-radius:8px;">
            </template>
            <template v-else><span style="font-size:14px;">📄 {{ f.name }}</span></template>
            <div style="margin-top:6px;display:flex;gap:8px;justify-content:space-between;">
              <a :href="f.dataUrl" :download="f.name" class="btn">다운로드</a>
              <button class="btn" @click="removeFile(f.id)">삭제</button>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn primary" @click="saveLog">저장</button>
          <button class="btn" @click="resetLog">초기화</button>
        </div>

        <table v-if="logs.length" style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead><tr><th class="th">일시</th><th class="th">태그</th><th class="th">내용/첨부</th><th class="th">작업</th></tr></thead>
          <tbody>
            <tr v-for="r in logs" :key="r.id">
              <td class="td" style="white-space:nowrap;">{{ r.datetime }}</td>
              <td class="td" style="min-width:140px;">
                <span v-for="t in r.tags" :key="r.id+'-'+t" class="chip" style="margin-right:6px;">{{ t }}</span>
              </td>
              <td class="td">
                <div style="white-space:pre-wrap;">{{ r.content }}</div>
                <div v-if="r.files?.length" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                  <div v-for="f in r.files" :key="f.id" class="card" style="padding:6px;">
                    <template v-if="f.type.startsWith('image/')">
                      <img :src="f.dataUrl" :alt="f.name" style="width:100px;max-height:100px;object-fit:cover;border-radius:6px;">
                    </template>
                    <template v-else><span style="font-size:13px;">📄 {{ f.name }}</span></template>
                  </div>
                </div>
              </td>
              <td class="td" style="white-space:nowrap;">
                <button class="btn" @click="editLog(r)">수정</button>
                <button class="btn" @click="delLog(r.id)">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:var(--muted);margin:0;">아직 일지가 없습니다.</p>
      </div>

      <!-- 2) 체크리스트 -->
      <div v-else-if="sub==='tasks'" class="card" style="padding:10px;display:grid;gap:8px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <input class="input" v-model="taskText" placeholder="할 일을 입력 후 Enter" @keydown.enter.prevent="addTask" style="min-width:260px;">
          <button class="btn primary" @click="addTask">추가</button>
          <button class="btn" @click="sortTasks">정렬(미완료 먼저)</button>
          <button class="btn" @click="clearDone">완료 비우기</button>
        </div>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px;">
          <li v-for="t in tasks" :key="t.id" class="task">
            <label style="display:flex;gap:8px;align-items:center;">
              <input type="checkbox" v-model="t.done" @change="toggleTask(t.id)">
              <span :style="{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--muted)' : 'inherit' }">
                {{ t.text }}
              </span>
            </label>
            <button class="btn" @click="removeTask(t.id)">삭제</button>
          </li>
        </ul>
      </div>

      <!-- 3) 예산관리 -->
      <div v-else-if="sub==='budget'" class="card" style="padding:10px;display:grid;gap:10px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <h3 style="margin:0;">예산 요약</h3>
          <span class="pill ok">총예산: {{ fmt(summary.total) }}원</span>
          <span class="pill">수입: {{ fmt(summary.income) }}원</span>
          <span class="pill warn">지출: {{ fmt(summary.expense) }}원</span>
          <span class="pill strong">잔액: {{ fmt(summary.balance) }}원</span>
        </div>

        <div class="card" style="padding:10px;display:grid;gap:8px;">
          <strong>세목</strong>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <input class="input" v-model="catName" placeholder="세목명" style="min-width:200px;">
            <input class="input" type="number" v-model.number="catTotal" placeholder="총예산(원)" style="width:160px;">
            <button class="btn primary" @click="addCategory">추가</button>
          </div>
          <table v-if="cats.length" style="width:100%;border-collapse:collapse;">
            <thead><tr><th class="th">세목</th><th class="th">총예산</th><th class="th">수입</th><th class="th">지출</th><th class="th">잔액</th><th class="th">작업</th></tr></thead>
            <tbody>
              <tr v-for="c in cats" :key="c.id">
                <td class="td"><input class="input" v-model="c.name" @change="updateCategory(c)" style="min-width:160px;"></td>
                <td class="td"><input class="input" type="number" v-model.number="c.total" @change="updateCategory(c)" style="width:140px;text-align:right;"></td>
                <td class="td" style="text-align:right;">{{ fmt(inc(c.id)) }}</td>
                <td class="td" style="text-align:right;">{{ fmt(exp(c.id)) }}</td>
                <td class="td" style="text-align:right;font-weight:600;">{{ fmt(bal(c.id)) }}</td>
                <td class="td"><button class="btn" @click="removeCategory(c.id)">삭제</button></td>
              </tr>
            </tbody>
          </table>
          <p v-else style="color:var(--muted);margin:0;">세목이 없습니다. 위에서 추가하세요.</p>
        </div>

        <div class="card" style="padding:10px;display:grid;gap:8px;">
          <strong>수입/지출 내역</strong>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <input class="input" type="date" v-model="eDate">
            <select class="input" v-model="eCat" style="min-width:160px;">
              <option disabled value="">세목 선택</option>
              <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select class="input" v-model="eType" style="width:120px;">
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>
            <input class="input" type="number" v-model.number="eAmt" placeholder="금액(원)" style="width:160px;">
            <input class="input" v-model="eMemo" placeholder="내용" style="min-width:240px;">
            <button class="btn primary" @click="addEntry">추가</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <select class="input" v-model="filterCat" style="min-width:160px;">
              <option value="">세목 전체</option>
              <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select class="input" v-model="filterType" style="width:120px;">
              <option value="">유형 전체</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>
            <button class="btn" @click="exportBudgetCsv" :disabled="!entriesFiltered.length">CSV</button>
          </div>

          <table v-if="entriesFiltered.length" style="width:100%;border-collapse:collapse;">
            <thead><tr><th class="th">일자</th><th class="th">세목</th><th class="th">유형</th><th class="th">금액</th><th class="th">내용</th><th class="th">작업</th></tr></thead>
            <tbody>
              <tr v-for="e in entriesFiltered" :key="e.id">
                <td class="td">{{ e.date }}</td>
                <td class="td">{{ catNameById(e.categoryId) }}</td>
                <td class="td">{{ e.type==='income' ? '수입' : '지출' }}</td>
                <td class="td" style="text-align:right;">{{ fmt(e.amount) }}</td>
                <td class="td">{{ e.memo }}</td>
                <td class="td">
                  <button class="btn" @click="editEntry(e)">수정</button>
                  <button class="btn" @click="removeEntry(e.id)">삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else style="color:var(--muted);margin:0;">내역이 없습니다.</p>

          <div v-if="editing" class="card" style="padding:8px;margin-top:8px;">
            <strong>내역 수정</strong>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px;">
              <input class="input" type="date" v-model="editForm.date" />
              <select class="input" v-model="editForm.categoryId" style="min-width:160px;">
                <option disabled value="">세목 선택</option>
                <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <select class="input" v-model="editForm.type" style="width:120px;">
                <option value="income">수입</option>
                <option value="expense">지출</option>
              </select>
              <input class="input" type="number" v-model.number="editForm.amount" placeholder="금액(원)" style="width:160px;">
              <input class="input" v-model="editForm.memo" placeholder="내용" style="min-width:240px;">
              <button class="btn primary" @click="saveEdit">저장</button>
              <button class="btn" @click="cancelEdit">취소</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4) 인수인계 -->
      <div v-else class="card" style="padding:10px;display:grid;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;">업무 인수인계</h3>
          <button class="btn" @click="downloadHandover">다운로드(TXT)</button>
        </div>
        <textarea class="input" rows="12" v-model="handoverText" @input="saveHandover"
          placeholder="예) 목적/현황/담당자/연락처/주요 일정/진행상태/예산/주의사항/향후 계획 등"></textarea>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BtnLink from '@/components/BtnLink.vue'
import { useSettingsStore } from '@/stores/settings'
import { useWorkStore } from '@/stores/work'

const settings = useSettingsStore()
const work = useWorkStore()
onMounted(()=> work.init())

/* 관리자 업무 목록 */
const workNames = computed(()=>{
  const arr = Array.isArray(settings.works) ? settings.works : []
  return [...new Set(arr.map(s=>String(s||'').trim()).filter(Boolean))]
})
const active = ref('')
watch(workNames,(arr)=>{
  if (!arr.length){ active.value=''; return }
  if (!arr.includes(active.value)) active.value = arr[0]
},{ immediate:true })

/* 저장시각 */
const savedText = computed(()=>{
  if (!work.savedAt) return ''
  const d=new Date(work.savedAt)
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0')
  const hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})

/* 서브 탭 */
const subTabs = [
  { key:'log',     label:'업무일지' },
  { key:'tasks',   label:'체크리스트' },
  { key:'budget',  label:'예산관리' },
  { key:'handover',label:'인수인계' },
]
const sub = ref('log')

/* ===== 업무일지 ===== */
function kstNowLocal(){
  const d=new Date(), z=d.getTimezoneOffset()
  return new Date(d.getTime()-z*60000).toISOString().slice(0,16) // datetime-local
}
const logDt = ref(kstNowLocal())
const logText = ref('')
const tags = ref([])
const tagText = ref('')
const files = ref([])
const fileEl = ref(null)

const logs = computed(()=> work.listLogs(active.value))

function commitTag(){
  const arr = tagText.value.split(',').map(s=>s.trim()).filter(Boolean)
  arr.forEach(t=>{ if(!tags.value.includes(t)) tags.value.push(t) })
  tagText.value = ''
}
function maybeCommitComma(e){ if (e.key===',' || e.code==='Comma'){ e.preventDefault(); commitTag() } }
function removeTag(t){ tags.value = tags.value.filter(x=>x!==t) }

function pickFiles(){ fileEl.value?.click() }
function onFiles(e){
  const fl = Array.from(e.target.files || [])
  const readers = fl.map(f => new Promise((resolve,reject)=>{
    const r = new FileReader()
    r.onerror = ()=> reject(new Error('read fail'))
    r.onload = ()=> resolve({ id: Date.now()+Math.random(), name: f.name, type: f.type, dataUrl: r.result })
    r.readAsDataURL(f)
  }))
  Promise.all(readers).then(arr=>{ files.value.push(...arr) }).finally(()=>{ e.target.value='' })
}
function removeFile(id){ files.value = files.value.filter(f=>f.id!==id) }

function saveLog(){
  const content = logText.value.trim(); if (!content) return
  const dt = logDt.value.replace('T',' ')
  work.addLog(active.value, { datetime: dt, content, tags: [...tags.value], files: [...files.value] })
  resetLog()
}
function editLog(r){
  logDt.value = r.datetime.replace(' ','T'); logText.value = r.content
  tags.value = [...(r.tags||[])]; files.value = [...(r.files||[])]
  // 간단 모드: 수정 후 저장 누르면 새 로그 추가로 처리 (필요시 updateLog를 호출하도록 확장 가능)
}
function delLog(id){ if (!confirm('삭제할까요?')) return; work.removeLog(active.value, id) }
function resetLog(){ logDt.value = kstNowLocal(); logText.value=''; tags.value=[]; tagText.value=''; files.value=[] }

/* ===== 체크리스트 ===== */
const tasks = computed(()=> work.listTasks(active.value))
const taskText = ref('')
function addTask(){ const t=taskText.value.trim(); if(!t) return; work.addTask(active.value, t); taskText.value='' }
function toggleTask(id){ work.toggleTask(active.value, id) }
function removeTask(id){ work.removeTask(active.value, id) }
function clearDone(){ work.clearDone(active.value) }
function sortTasks(){ work.sortTasks(active.value) }

/* ===== 예산관리 ===== */
const summary = computed(()=> work.summary(active.value))
const cats = computed(()=> work.cats(active.value))
const inc = (cid)=> work.catIncome(active.value, cid)
const exp = (cid)=> work.catExpense(active.value, cid)
const bal = (cid)=> work.catBalance(active.value, cid)
const fmt = (n)=> (Number(n)||0).toLocaleString()

const catName = ref(''); const catTotal = ref(0)
function addCategory(){ work.addCategory(active.value, catName.value, catTotal.value); catName.value=''; catTotal.value=0 }
function updateCategory(c){ work.updateCategory(active.value, c.id, { name: c.name, total: c.total }) }
function removeCategory(id){
  const ok = work.removeCategory(active.value, id)
  if (!ok) alert('해당 세목의 내역이 있어 삭제할 수 없습니다.')
}

function today(){ const d=new Date(), z=d.getTimezoneOffset(); return new Date(d.getTime()-z*60000).toISOString().slice(0,10) }
const eDate = ref(today())
const eCat = ref('')
const eType = ref('expense')
const eAmt = ref(0)
const eMemo = ref('')
function addEntry(){
  work.addEntry(active.value, { date: eDate.value, categoryId: eCat.value, type: eType.value, amount: eAmt.value, memo: eMemo.value })
  eAmt.value=0; eMemo.value=''
}
const filterCat = ref(''); const filterType = ref('')
const entriesFiltered = computed(()=>{
  return (work.entries(active.value)||[]).filter(e =>
    (!filterCat.value || e.categoryId===filterCat.value) &&
    (!filterType.value || e.type===filterType.value)
  )
})
function catNameById(id){ return cats.value.find(c=>c.id===id)?.name || '' }

const editing = ref(false)
const editForm = ref({ id:null, date:'', categoryId:'', type:'expense', amount:0, memo:'' })
function editEntry(e){ editing.value=true; editForm.value={ ...e } }
function saveEdit(){ work.updateEntry(active.value, editForm.value.id, { ...editForm.value }); editing.value=false }
function cancelEdit(){ editing.value=false }
function removeEntry(id){ if(!confirm('삭제할까요?')) return; work.removeEntry(active.value, id) }

function exportBudgetCsv(){
  const head = ['업무','일자','세목','유형','금액','내용','총예산','세목잔액(현재기준)']
  const rows = (work.entries(active.value)||[]).map(e=>{
    const name = catNameById(e.categoryId)
    const tot = work.catTotal(active.value, e.categoryId)
    const balNow = work.catBalance(active.value, e.categoryId)
    return [active.value, e.date, name, e.type==='income'?'수입':'지출', e.amount, e.memo, tot, balNow]
  })
  if (!rows.length){ alert('내보낼 내역이 없습니다.'); return }
  const csv = toCSV([head, ...rows])
  download('\uFEFF'+csv, 'text/csv;charset=utf-8', `업무_${active.value}_예산_${yyyymmdd()}.csv`)
}

/* ===== 인수인계 ===== */
const handoverText = ref('')
watch(active, (w)=>{
  handoverText.value = work.handover[w] || ''
}, { immediate:true })
function saveHandover(){ work.setHandover(active.value, handoverText.value) }
function downloadHandover(){
  const name = `업무_${active.value}_인수인계_${yyyymmdd()}.txt`
  download(handoverText.value || '', 'text/plain;charset=utf-8', name)
}

/* ===== 공통 유틸 ===== */
function toCSV(aoa){ return aoa.map(r=>r.map(csvEsc).join(',')).join('\n') }
function csvEsc(v){ const s=String(v??''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s }
function download(data, type, name){
  const blob=new Blob([data],{type}); const a=document.createElement('a')
  a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href)
}
function yyyymmdd(){ const d=new Date(), y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return `${y}${m}${dd}` }
</script>

<style scoped>
.tab-btn{ padding:6px 14px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; cursor:pointer; }
.tab-btn.active{ background:#fff; border-color:#3b82f6; color:#1d4ed8; font-weight:600; }
.th,.td{ padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
.chip{ display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border:1px solid var(--border);
  border-radius:999px; background:#fff; font-size:12px; }
.chip-x{ border:none; background:transparent; cursor:pointer; font-size:12px; }
.task{ display:flex; justify-content:space-between; align-items:center; padding:8px; border:1px solid var(--border); border-radius:8px; background:#fff; }
.pill{ display:inline-block; padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:#fff; }
.pill.ok{ background:#ecfdf5; border-color:#a7f3d0; }
.pill.warn{ background:#fff7ed; border-color:#fed7aa; }
.pill.strong{ background:#eef2ff; border-color:#c7d2fe; }
</style>
