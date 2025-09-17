import { defineStore } from 'pinia'

const KEY = 'work_center_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}
function uid(){ return Date.now() + Math.random() }

export const useWorkStore = defineStore('workCenter', {
  state: () => ({
    // 업무별 일지: { [work]: [{id, datetime:'YYYY-MM-DD HH:mm', content, tags:string[], files:[{id,name,type,dataUrl}]}] }
    logs: {},
    // 업무별 체크리스트: { [work]: [{id, text, done}] }
    tasks: {},
    // 업무별 예산
    budgetCategories: {}, // { [work]: [{id, name, total:number}] }
    budgetEntries: {},    // { [work]: [{id, date:'YYYY-MM-DD', categoryId, type:'income'|'expense', amount:number, memo}] }
    // 업무별 인수인계 메모
    handover: {},         // { [work]: string }

    savedAt: null,
  }),
  getters: {
    listLogs: s => work => s.logs[work] || [],
    listTasks: s => work => s.tasks[work] || [],
    cats:     s => work => s.budgetCategories[work] || [],
    entries:  s => work => s.budgetEntries[work] || [],
    // 예산 합계
    catTotal: (s) => (work, cid) => (s.budgetCategories[work] || []).find(c=>c.id===cid)?.total || 0,
    catIncome(s){
      return (work, cid) => (s.budgetEntries[work]||[])
        .filter(e=>e.categoryId===cid && e.type==='income')
        .reduce((a,b)=>a+Number(b.amount||0),0)
    },
    catExpense(s){
      return (work, cid) => (s.budgetEntries[work]||[])
        .filter(e=>e.categoryId===cid && e.type==='expense')
        .reduce((a,b)=>a+Number(b.amount||0),0)
    },
    catBalance(){
      return (work, cid) => this.catTotal(work, cid) + this.catIncome(work, cid) - this.catExpense(work, cid)
    },
    summary(s){
      return (work) => {
        const tot = (s.budgetCategories[work]||[]).reduce((a,c)=>a+Number(c.total||0),0)
        const inc = (s.budgetEntries[work]||[]).filter(e=>e.type==='income').reduce((a,b)=>a+Number(b.amount||0),0)
        const exp = (s.budgetEntries[work]||[]).filter(e=>e.type==='expense').reduce((a,b)=>a+Number(b.amount||0),0)
        return { total: tot, income: inc, expense: exp, balance: tot+inc-exp }
      }
    }
  },
  actions: {
    init(){
      const v = load()
      if (v) Object.assign(this, v)
    },
    persist(){
      this.savedAt = new Date().toISOString()
      save({
        logs: this.logs,
        tasks: this.tasks,
        budgetCategories: this.budgetCategories,
        budgetEntries: this.budgetEntries,
        handover: this.handover,
        savedAt: this.savedAt
      })
    },

    /* ===== 일지 ===== */
    addLog(work, { datetime, content, tags=[], files=[] }){
      if (!work || !content) return
      if (!this.logs[work]) this.logs[work] = []
      this.logs[work].unshift({ id: uid(), datetime, content, tags, files })
      this.persist()
    },
    updateLog(work, id, patch){
      const arr = this.logs[work] || []; const i = arr.findIndex(x=>x.id===id); if (i<0) return
      arr[i] = { ...arr[i], ...patch }
      this.persist()
    },
    removeLog(work, id){
      if (!this.logs[work]) return
      this.logs[work] = this.logs[work].filter(x=>x.id!==id)
      this.persist()
    },
    clearLogs(work){ this.logs[work] = []; this.persist() },

    /* ===== 체크리스트 ===== */
    addTask(work, text){
      const t = (text||'').trim(); if (!t) return
      if (!this.tasks[work]) this.tasks[work] = []
      this.tasks[work].unshift({ id: uid(), text: t, done: false })
      this.persist()
    },
    toggleTask(work, id){
      const arr = this.tasks[work] || []; const i=arr.findIndex(x=>x.id===id); if (i<0) return
      arr[i].done = !arr[i].done; this.persist()
    },
    removeTask(work, id){
      if (!this.tasks[work]) return
      this.tasks[work] = this.tasks[work].filter(x=>x.id!==id)
      this.persist()
    },
    clearDone(work){
      if (!this.tasks[work]) return
      this.tasks[work] = this.tasks[work].filter(x=>!x.done)
      this.persist()
    },
    sortTasks(work){
      if (!this.tasks[work]) return
      this.tasks[work] = [...this.tasks[work]].sort((a,b)=>Number(a.done)-Number(b.done))
      this.persist()
    },

    /* ===== 예산 ===== */
    addCategory(work, name, total=0){
      const n = (name||'').trim(); if (!n) return
      if (!this.budgetCategories[work]) this.budgetCategories[work] = []
      this.budgetCategories[work].push({ id: uid(), name: n, total: Number(total)||0 })
      this.persist()
    },
    updateCategory(work, id, patch){
      const arr = this.budgetCategories[work] || []; const i = arr.findIndex(c=>c.id===id); if (i<0) return
      arr[i] = { ...arr[i], ...patch, total: Number(patch.total ?? arr[i].total) }
      this.persist()
    },
    removeCategory(work, id){
      const hasEntry = (this.budgetEntries[work]||[]).some(e=>e.categoryId===id)
      if (hasEntry) return false
      this.budgetCategories[work] = (this.budgetCategories[work]||[]).filter(c=>c.id!==id)
      this.persist(); return true
    },

    addEntry(work, { date, categoryId, type, amount, memo }){
      if (!date || !categoryId || !['income','expense'].includes(type)) return
      const amt = Number(amount||0); if (!amt) return
      if (!this.budgetEntries[work]) this.budgetEntries[work] = []
      this.budgetEntries[work].unshift({ id: uid(), date, categoryId, type, amount: amt, memo: memo||'' })
      this.persist()
    },
    updateEntry(work, id, patch){
      const arr = this.budgetEntries[work] || []; const i = arr.findIndex(e=>e.id===id); if (i<0) return
      const next = { ...arr[i], ...patch }; next.amount = Number(next.amount||0)
      arr[i] = next; this.persist()
    },
    removeEntry(work, id){
      this.budgetEntries[work] = (this.budgetEntries[work]||[]).filter(e=>e.id!==id)
      this.persist()
    },
    clearBudget(work){ this.budgetCategories[work]=[]; this.budgetEntries[work]=[]; this.persist() },

    /* ===== 인수인계 ===== */
    setHandover(work, text){
      this.handover[work] = text || ''
      this.persist()
    }
  }
})
