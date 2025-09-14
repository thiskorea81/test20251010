import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    grade: null,      // 1~6
    classNo: null,    // 1~15
    subjects: [],     // ['수학','정보', ...]
  }),
  getters: {
    hasHomeroom: (s) => Number(s.grade) > 0 && Number(s.classNo) > 0,
  },
  actions: {
    setGrade(v){ this.grade = Number(v) || null },
    setClassNo(v){ this.classNo = Number(v) || null },
    addSubject(name){
      const t = String(name||'').trim()
      if (!t) return
      if (!this.subjects.includes(t)) this.subjects.push(t)
    },
    removeSubject(name){
      this.subjects = this.subjects.filter(s => s !== name)
    }
  }
})
