import { defineStore } from 'pinia'

export const useStudentsStore = defineStore('students', {
  state: () => ({
    list: []
  }),
  getters: {
    byId: (s) => (hakbun) => s.list.find(stu => String(stu['학번']) === String(hakbun)),
  },
  actions: {
    addMany(students) { this.list.push(...students) },
    clear() { this.list = [] }
  }
})
