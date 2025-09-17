<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;">예산 관리</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <small v-if="savedText" style="color:var(--muted)">{{ savedText }}</small>
        <BtnLink :to="'/club/notes'">업무 노트</BtnLink>
        <BtnLink :to="'/club'">동아리 명단</BtnLink>
      </div>
    </div>

    <!-- 요약 -->
    <section class="card" style="padding:12px;margin-top:12px;">
      <h3 style="margin:0 0 8px;">요약</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span class="pill ok">총예산: {{ fmt(summary.total) }}원</span>
        <span class="pill">수입: {{ fmt(summary.income) }}원</span>
        <span class="pill warn">지출: {{ fmt(summary.expense) }}원</span>
        <span class="pill strong">잔액: {{ fmt(summary.balance) }}원</span>
      </div>
    </section>

    <!-- 세목 -->
    <section class="card" style="padding:12px;margin-top:12px;display:grid;gap:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h3 style="margin:0;">세목</h3>
        <div style="display:flex;gap:8px;">
          <button class="btn" @click="exportCsv">CSV 내보내기</button>
          <button class="btn" @click="clearAllConfirm">전체 삭제</button>
        </div>
      </div>

      <!-- 추가/수정 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <input class="input" v-model="catName" placeholder="세목명" style="min-width:220px;">
        <input class="input" type="number" v-model.number="catTotal" placeholder="총예산(원)" style="width:160px;">
        <button class="btn primary" @click="addCategory">세목 추가</button>
      </div>

      <table v-if="cats.length" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th class="th">세목</th>
            <th class="th">총예산</th>
            <th class="th">수입</th>
            <th class="th">지출</th>
            <th class="th">잔액</th>
            <th class="th">작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cats" :key="c.id">
            <td class="td">
              <input class="input" v-model="c.name" @change="updateCategory(c)" style="min-width:180px;">
            </td>
            <td class="td">
              <input class="input" type="number" v-model.number="c.total" @change="updateCategory(c)" style="width:140px;text-align:right;">
            </td>
            <td class="td" style="text-align:right;">{{ fmt(inc(c.id)) }}</td>
            <td class="td" style="text-align:right;">{{ fmt(exp(c.id)) }}</td>
            <td class="td" style="text-align:right;font-weight:600;">{{ fmt(bal(c.id)) }}</td>
            <td class="td">
              <button class="btn" @click="removeCategory(c.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else style="color:var(--muted);margin:0;">세목이 없습니다. 위에서 추가하세요.</p>
    </section>

    <!-- 내역 -->
    <section class="card" style="padding:12px;margin-top:12px;display:grid;gap:10px;">
      <h3 style="margin:0;">수입/지출 내역</h3>

      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <input class="input" type="date" v-model="eDate" />
        <select class="input" v-model="eCat" style="min-width:180px;">
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

      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <select class="input" v-model="filterCat" style="min-width:180px;">
          <option value="">세목 전체</option>
          <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select class="input" v-model="filterType" style="width:120px;">
          <option value="">유형 전체</option>
          <option value="income">수입</option>
          <option value="expense">지출</option>
        </select>
      </div>

      <table v-if="entriesFiltered.length" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th class="th">일자</th>
            <th class="th">세목</th>
            <th class="th">유형</th>
            <th class="th">금액</th>
            <th class="th">내용</th>
            <th class="th">작업</th>
          </tr>
        </thead>
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

      <div v-if="editing" class="card" style="padding:10px;margin-top:8px;">
        <strong>내역 수정</strong>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px;">
          <input class="input" type="date" v-model="editForm.date" />
          <select class="input" v-model="editForm.categoryId" style="min-width:180px;">
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
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import BtnLink from '@/components/BtnLink.vue'
import { useClubBudgetStore } from '@/stores/clubBudget'

const budget = useClubBudgetStore()
onMounted(() => budget.init())

/* 요약 */
const summary = computed(()=> budget.summary)
const savedText = computed(()=>{
  if (!budget.savedAt) return ''
  const d = new Date(budget.savedAt)
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0')
  const hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0')
  return `저장됨 · ${y}-${m}-${dd} ${hh}:${mm}`
})
const fmt = (n)=> (Number(n)||0).toLocaleString()

/* 세목 */
const catName = ref(''); const catTotal = ref(0)
const cats = computed(()=> budget.categories)
function addCategory(){ budget.addCategory(catName.value, catTotal.value); catName.value=''; catTotal.value=0 }
function updateCategory(c){ budget.updateCategory(c.id, { name: c.name, total: c.total }) }
function removeCategory(id){
  const ok = budget.removeCategory(id)
  if (!ok) alert('해당 세목의 수입/지출 내역이 있어 삭제할 수 없습니다.')
}
const inc = (id)=> budget.catIncome(id)
const exp = (id)=> budget.catExpense(id)
const bal = (id)=> budget.catBalance(id)

/* 내역 */
function today(){ const d=new Date(), z=d.getTimezoneOffset(); return new Date(d.getTime()-z*60000).toISOString().slice(0,10) }
const eDate = ref(today())
const eCat = ref('')
const eType = ref('expense')
const eAmt = ref(0)
const eMemo = ref('')
function addEntry(){
  budget.addEntry({ date: eDate.value, categoryId: eCat.value, type: eType.value, amount: eAmt.value, memo: eMemo.value })
  eAmt.value = 0; eMemo.value = ''
}
const filterCat = ref(''); const filterType = ref('')
const entriesFiltered = computed(()=>{
  return budget.entries.filter(e =>
    (!filterCat.value || e.categoryId===filterCat.value) &&
    (!filterType.value || e.type===filterType.value)
  )
})
function catNameById(id){ return cats.value.find(c=>c.id===id)?.name || '' }

const editing = ref(false)
const editForm = ref({ id:null, date:'', categoryId:'', type:'expense', amount:0, memo:'' })
function editEntry(e){ editing.value=true; editForm.value={ ...e } }
function saveEdit(){ budget.updateEntry(editForm.value.id, { ...editForm.value }); editing.value=false }
function cancelEdit(){ editing.value=false }
function removeEntry(id){ if (!confirm('삭제할까요?')) return; budget.removeEntry(id) }

/* CSV */
function exportCsv(){
  const head = ['일자','세목','유형','금액','내용','총예산','세목잔액(당시기준 아님)']
  const rows = budget.entries.map(e=>{
    const name = catNameById(e.categoryId)
    const tot = budget.catTotal(e.categoryId)
    const balNow = budget.catBalance(e.categoryId)
    return [e.date, name, e.type==='income'?'수입':'지출', e.amount, e.memo, tot, balNow]
  })
  const csv = toCSV([head, ...rows])
  downloadText('\uFEFF'+csv, 'text/csv;charset=utf-8', `동아리_예산내역_${yyyymmdd()}.csv`)
}
function toCSV(aoa){ return aoa.map(r=>r.map(csvEscape).join(',')).join('\n') }
function csvEscape(v){ const s=String(v??''); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s }
function downloadText(data, mime, name){
  const blob=new Blob([data],{type:mime}); const a=document.createElement('a')
  a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href)
}
function yyyymmdd(){ const d=new Date(), y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return `${y}${m}${dd}` }

function clearAllConfirm(){ if(!confirm('예산/내역을 전부 삭제할까요?')) return; budget.clearAll() }
</script>

<style scoped>
.th, .td { padding:8px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; }
.pill{ display:inline-block; padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:#fff; }
.pill.ok{ background:#ecfdf5; border-color:#a7f3d0; }
.pill.warn{ background:#fff7ed; border-color:#fed7aa; }
.pill.strong{ background:#eef2ff; border-color:#c7d2fe; }
</style>
