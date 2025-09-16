import { defineStore } from 'pinia'

export const useStudentsStore = defineStore('students', {
  state: () => ({
    list: [] // [{ 학번, 학년, 반, 번호, 이름, 성별, 연락처, 보호자1연락처, 보호자2연락처, 주소, 비고 }]
  }),
  getters: {
    byId: (s) => (hakbun) => s.list.find(stu => String(stu['학번']) === String(hakbun)),
  },
  actions: {
    addMany(students) {
      this.list.push(...students)
    },
    clear() {
      this.list = []
    },
    update(hakbun, patch = {}) {
      const id = String(hakbun)
      this.list = this.list.map(stu => {
        if (String(stu['학번']) !== id) return stu
        // 필드 덮어쓰기(존재하는 컬럼만)
        const next = { ...stu }
        for (const [k, v] of Object.entries(patch)) next[k] = v
        return next
      })
    }
  }
})
