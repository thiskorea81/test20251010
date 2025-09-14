import { defineStore } from 'pinia'

// KST "YYYY-MM-DD HH:MM"
function kstNowStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().slice(0,16).replace('T',' ')
}

export const useCounselStore = defineStore('counsel', {
  state: () => ({
    // { [학번]: [ { id, datetime, content, tags: string[], files: [{id,name,type,dataUrl}] } ] }
    byStudent: {}
  }),
  getters: {
    listById: (s) => (hakbun) => s.byStudent[hakbun] || []
  },
  actions: {
    add(hakbun, content, datetime = kstNowStr(), tags = [], files = []) {
      const rec = {
        id: Date.now(),
        datetime,
        content: String(content || '').trim(),
        tags: Array.isArray(tags) ? tags : [],
        files: Array.isArray(files) ? files : [],
      }
      if (!rec.content) return
      if (!this.byStudent[hakbun]) this.byStudent[hakbun] = []
      this.byStudent[hakbun].unshift(rec)
    },
    update(hakbun, id, patch) {
      const arr = this.byStudent[hakbun] || []
      const it = arr.find(r => r.id === id)
      if (it) Object.assign(it, patch)
    },
    remove(hakbun, id) {
      const arr = this.byStudent[hakbun] || []
      this.byStudent[hakbun] = arr.filter(r => r.id !== id)
    },
    clearAll(hakbun) {
      this.byStudent[hakbun] = []
    }
  }
})
