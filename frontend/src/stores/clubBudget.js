import { defineStore } from 'pinia'

const KEY = 'club_budget_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
function save(state) { localStorage.setItem(KEY, JSON.stringify(state)) }
function uid() { return Date.now() + Math.random() }

export const useClubBudgetStore = defineStore('clubBudget', {
  state: () => ({
    categories: [], // [{id, name, total}]  // total = 세목 총예산
    entries: [],    // [{id, date:'YYYY-MM-DD', categoryId, type:'income'|'expense', amount:number, memo:string}]
    savedAt: null,
  }),
  getters: {
    catTotal: (s) => (cid) => (s.categories.find(c => c.id===cid)?.total || 0),
    catIncome: (s) => (cid) => s.entries.filter(e=>e.categoryId===cid && e.type==='income')
                                       .reduce((a,b)=>a+Number(b.amount||0),0),
    catExpense: (s) => (cid) => s.entries.filter(e=>e.categoryId===cid && e.type==='expense')
                                        .reduce((a,b)=>a+Number(b.amount||0),0),
    catBalance() {
      return (cid) => this.catTotal(cid) + this.catIncome(cid) - this.catExpense(cid)
    },
    summary(state){
      const total = state.categories.reduce((a,c)=>a+Number(c.total||0),0)
      const income = state.entries.filter(e=>e.type==='income').reduce((a,b)=>a+Number(b.amount||0),0)
      const expense = state.entries.filter(e=>e.type==='expense').reduce((a,b)=>a+Number(b.amount||0),0)
      const balance = total + income - expense
      return { total, income, expense, balance }
    }
  },
  actions: {
    init(){
      const s = load()
      if (s) Object.assign(this, s)
    },
    persist(){
      this.savedAt = new Date().toISOString()
      save({ categories: this.categories, entries: this.entries, savedAt: this.savedAt })
    },
    /* 세목 */
    addCategory(name, total=0){
      const n = (name||'').trim(); if (!n) return
      this.categories.push({ id: uid(), name: n, total: Number(total)||0 })
      this.persist()
    },
    updateCategory(id, patch){
      const i = this.categories.findIndex(c=>c.id===id); if (i<0) return
      this.categories[i] = { ...this.categories[i], ...patch, total: Number(patch.total ?? this.categories[i].total) }
      this.persist()
    },
    removeCategory(id){
      // 해당 세목의 내역이 없어야 삭제 허용
      if (this.entries.some(e=>e.categoryId===id)) return false
      this.categories = this.categories.filter(c=>c.id!==id)
      this.persist()
      return true
    },
    /* 내역 */
    addEntry({ date, categoryId, type, amount, memo }){
      if (!date || !categoryId || !['income','expense'].includes(type)) return
      const amt = Number(amount||0); if (!amt) return
      this.entries.unshift({ id: uid(), date, categoryId, type, amount: amt, memo: memo||'' })
      this.persist()
    },
    updateEntry(id, patch){
      const i = this.entries.findIndex(e=>e.id===id); if (i<0) return
      const next = { ...this.entries[i], ...patch }
      next.amount = Number(next.amount||0)
      this.entries[i] = next
      this.persist()
    },
    removeEntry(id){
      this.entries = this.entries.filter(e=>e.id!==id)
      this.persist()
    },
    clearAll(){
      this.categories = []; this.entries = []; this.persist()
    }
  }
})
