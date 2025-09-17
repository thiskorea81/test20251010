import { defineStore } from 'pinia'

const KEY = 'subjects_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
function save(state) { localStorage.setItem(KEY, JSON.stringify(state)) }
function uid() { return Date.now() + Math.random() }

export const useSubjectsStore = defineStore('subjects', {
  state: () => ({
    subjects: [],           // [{id, name}]
    rosters: {},            // { [subjectId]: [{학생개인번호, 성명, 학년, 반, 번호}] }
    attendance: {},         // { [subjectId]: { [date]: { [학생개인번호]: 'present'|'absent'|'late'|'early' } } }
    savedAt: null,
  }),
  getters: {
    list(state){ return state.subjects },
    roster: (s) => (sid) => s.rosters[sid] || [],
    dayMap: (s) => (sid, date) => (s.attendance[sid]?.[date]) || {},
  },
  actions: {
    init(){
      const v = load()
      if (v) Object.assign(this, v)
    },
    persist(){
      this.savedAt = new Date().toISOString()
      save({
        subjects: this.subjects,
        rosters: this.rosters,
        attendance: this.attendance,
        savedAt: this.savedAt
      })
    },
    /* 수업 탭 */
    addSubject(name){
      const n = (name||'').trim(); if (!n) return
      const id = 'S' + uid()
      this.subjects.push({ id, name: n })
      if (!this.rosters[id]) this.rosters[id] = []
      if (!this.attendance[id]) this.attendance[id] = {}
      this.persist()
      return id
    },
    renameSubject(id, name){
      const i = this.subjects.findIndex(s=>s.id===id); if (i<0) return
      this.subjects[i].name = (name||'').trim()
      this.persist()
    },
    removeSubject(id){
      this.subjects = this.subjects.filter(s=>s.id!==id)
      delete this.rosters[id]
      delete this.attendance[id]
      this.persist()
    },

    /* 명단 업로드/설정 */
    setRoster(id, rows){
      this.rosters[id] = rows
      this.persist()
    },
    clearRoster(id){
      this.rosters[id] = []
      this.persist()
    },

    /* 출석 */
    setStatus(id, date, studentId, status){ // status: present/absent/late/early
      if (!this.attendance[id]) this.attendance[id] = {}
      if (!this.attendance[id][date]) this.attendance[id][date] = {}
      this.attendance[id][date][studentId] = status
      this.persist()
    },
    clearDay(id, date){
      if (this.attendance[id]) delete this.attendance[id][date]
      this.persist()
    }
  }
})
