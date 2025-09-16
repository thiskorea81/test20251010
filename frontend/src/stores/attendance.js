import { defineStore } from 'pinia'

// YYYY-MM
function monthKey(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 7)
}
// YYYY
function yearKey(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 4)
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    // byStudent[학번] = {
    //   menstrual: [{ id, date:'YYYY-MM-DD', subtype:'absent'|'early'|'late', note }],
    //   experiential: [{ id, date:'YYYY-MM-DD', type:'domestic'|'overseas', days:Number, note }]
    // }
    byStudent: {}
  }),
  getters: {
    menstrualList: (s) => (hakbun) => (s.byStudent[hakbun]?.menstrual || []),
    expList: (s) => (hakbun) => (s.byStudent[hakbun]?.experiential || []),

    // (기존) subtype별 월 횟수 — 필요 시 통계용으로 유지
    menstrualCount: (s) => (hakbun, yyyymm, subtype) => {
      const list = s.byStudent[hakbun]?.menstrual || []
      return list.filter(r => monthKey(r.date) === yyyymm && r.subtype === subtype).length
    },
    // ✅ 월 전체 합계 (유형 무관 월 1회 제한용)
    menstrualCountMonthAll: (s) => (hakbun, yyyymm) => {
      const list = s.byStudent[hakbun]?.menstrual || []
      return list.filter(r => monthKey(r.date) === yyyymm).length
    },

    // 연도별 체험학습 사용 일수 합계
    expDaysUsed: (s) => (hakbun, yyyy, type) => {
      const list = s.byStudent[hakbun]?.experiential || []
      return list
        .filter(r => yearKey(r.date) === yyyy && r.type === type)
        .reduce((a, r) => a + Number(r.days || 0), 0)
    },
  },
  actions: {
    addMenstrual(hakbun, { date, subtype, note }) {
      if (!this.byStudent[hakbun]) this.byStudent[hakbun] = { menstrual: [], experiential: [] }
      this.byStudent[hakbun].menstrual.unshift({
        id: Date.now() + Math.random(),
        date, subtype, note: (note || '').trim()
      })
    },
    removeMenstrual(hakbun, id) {
      const list = this.byStudent[hakbun]?.menstrual || []
      this.byStudent[hakbun].menstrual = list.filter(r => r.id !== id)
    },

    addExp(hakbun, { date, type, days, note }) {
      if (!this.byStudent[hakbun]) this.byStudent[hakbun] = { menstrual: [], experiential: [] }
      this.byStudent[hakbun].experiential.unshift({
        id: Date.now() + Math.random(),
        date, type, days: Number(days || 0), note: (note || '').trim()
      })
    },
    removeExp(hakbun, id) {
      const list = this.byStudent[hakbun]?.experiential || []
      this.byStudent[hakbun].experiential = list.filter(r => r.id !== id)
    },
  }
})
