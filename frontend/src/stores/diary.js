import { defineStore } from 'pinia'

// YYYY-MM-DD (로컬/한국시간 기준)로 얻기
function localDateStr(d = new Date()) {
  const tz = d.getTimezoneOffset()         // 분
  const local = new Date(d.getTime() - tz * 60000) // 로컬 기준 ISO
  return local.toISOString().slice(0, 10)
}

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    // ✅ 업무일지 날짜용(할 일과 무관). 한국시간 기준.
    selectedDate: localDateStr(),
    // ✅ 전역 할 일 목록(날짜와 무관)
    items: [
      // { id, text, done }
    ],
  }),
  actions: {
    setDate(dateStr) { this.selectedDate = dateStr },
    add(text) {
      const t = text?.trim()
      if (!t) return
      this.items.push({ id: Date.now(), text: t, done: false })
    },
    setDone(id, done) {
      const it = this.items.find(i => i.id === id)
      if (it) it.done = !!done
    },
    remove(id) { this.items = this.items.filter(i => i.id !== id) },
    clearDone() { this.items = this.items.filter(i => !i.done) },
  },
})
