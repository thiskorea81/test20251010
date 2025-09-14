import { defineStore } from 'pinia'

export const useWorklogStore = defineStore('worklog', {
  state: () => ({
    byDate: {
      // 'YYYY-MM-DD': '업무일지 내용'
    },
  }),
  getters: {
    text: (s) => (dateStr) => s.byDate[dateStr] || '',
  },
  actions: {
    set(dateStr, text) {
      this.byDate[dateStr] = text
    },
  },
})
