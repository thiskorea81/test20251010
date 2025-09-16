import { defineStore } from 'pinia'

const KEY = 'club_activity_v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export const useClubActivityStore = defineStore('clubActivity', {
  state: () => ({
    byId: load(), // { [studentId]: [{id, datetime:'YYYY-MM-DD HH:mm', content}] }
  }),
  actions: {
    listById(id) { return this.byId[id] || [] },
    add(id, datetime, content){
      const rec = { id: Date.now() + Math.random(), datetime, content }
      const arr = this.byId[id] || []
      this.byId[id] = [rec, ...arr]
      save(this.byId)
    },
    update(id, rid, patch){
      const arr = this.byId[id] || []
      const idx = arr.findIndex(r => r.id === rid)
      if (idx >= 0){
        this.byId[id][idx] = { ...arr[idx], ...patch }
        save(this.byId)
      }
    },
    remove(id, rid){
      const arr = this.byId[id] || []
      this.byId[id] = arr.filter(r => r.id !== rid)
      save(this.byId)
    },
    clearAll(id){
      if (this.byId[id]) delete this.byId[id]
      save(this.byId)
    }
  }
})
