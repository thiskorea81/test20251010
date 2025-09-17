import { defineStore } from 'pinia'

const KEY = 'club_notes_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}

export const useClubNotesStore = defineStore('clubNotes', {
  state: () => ({
    plan: '',       // 운영 계획
    schedule: '',   // 일정 메모
    minutes: '',    // 회의록
    notice: '',     // 공지/연락
    budget: '',     // 예산 메모
    tasks: [],      // {id, text, done}
    savedAt: null,  // ISO string
  }),
  actions: {
    init() {
      const s = load()
      if (s) Object.assign(this, s)
    },
    addTask(text) {
      const t = (text || '').trim()
      if (!t) return
      this.tasks.unshift({ id: Date.now() + Math.random(), text: t, done: false })
      this.persist()
    },
    toggleTask(id) {
      const i = this.tasks.findIndex(x => x.id === id)
      if (i >= 0) { this.tasks[i].done = !this.tasks[i].done; this.persist() }
    },
    removeTask(id) {
      this.tasks = this.tasks.filter(x => x.id !== id)
      this.persist()
    },
    sortTasks() {
      // 미완료 먼저, 완료는 뒤로
      this.tasks = [...this.tasks].sort((a,b)=> Number(a.done)-Number(b.done))
      this.persist()
    },
    setField(key, val) {
      this[key] = val
      this.persist()
    },
    persist() {
      this.savedAt = new Date().toISOString()
      localStorage.setItem(KEY, JSON.stringify({
        plan: this.plan, schedule: this.schedule, minutes: this.minutes,
        notice: this.notice, budget: this.budget,
        tasks: this.tasks, savedAt: this.savedAt,
      }))
    },
    clear() {
      this.plan = ''; this.schedule = ''; this.minutes = ''; this.notice = ''; this.tasks = []
      this.persist()
    }
  }
})

export default useClubNotesStore