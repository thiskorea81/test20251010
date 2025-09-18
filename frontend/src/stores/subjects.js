import { defineStore } from 'pinia'

const KEY = 'subjects_v2'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
function save(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj))
}

export const useSubjectsStore = defineStore('subjects', {
  state: () => ({
    // 명단/출결
    rosters: {},      // { subjectName: [ {학생개인번호, 성명, 학년, 반, 번호} ] }
    attendance: {},   // { subjectName: { 'YYYY-MM-DD': { studentId: 'present|absent|late|early' } } }

    // 일정(간단 캘린더에 표시할 메모)
    calendars: {},    // { subjectName: [ {id, date, title} ] }

    // 체크리스트
    tasks: {},        // { subjectName: [ {id, text, done} ] }

    // 평가계획
    evalPlan: {},     // { subjectName: { text: '' } }

    // 진도표
    progress: {},     // { subjectName: [ {id, date, unit, memo} ] }

    // 수업정리/노트
    lessonNotes: {},  // { subjectName: [ {id, date, text} ] }

    // 학생 활동 기록
    activities: {},   // { subjectName: { studentId: [ {id, datetime, content} ] } }

    // 학생별 특이사항
    studentNotes: {}, // { subjectName: { studentId: { attitude, presentation, participation, memo } } }

    savedAt: null,
  }),
  getters: {
    roster: (s) => (subject) => s.rosters[subject] || [],
    dayMap: (s) => (subject, date) => (s.attendance[subject]?.[date] || {}),
    taskList: (s) => (subject) => s.tasks[subject] || [],
    calList: (s) => (subject) => s.calendars[subject] || [],
    progressList: (s) => (subject) => s.progress[subject] || [],
    lessonList: (s) => (subject) => s.lessonNotes[subject] || [],
    actListByStudent: (s) => (subject, id) => (s.activities[subject]?.[id] || []),
    studentNote: (s) => (subject, id) => (s.studentNotes[subject]?.[id] || { attitude:'', presentation:'', participation:'', memo:'' }),
  },
  actions: {
    init() {
      const data = load()
      if (data) Object.assign(this, data)
    },
    persist() {
      this.savedAt = new Date().toISOString()
      save({
        rosters:this.rosters, attendance:this.attendance, calendars:this.calendars,
        tasks:this.tasks, evalPlan:this.evalPlan, progress:this.progress,
        lessonNotes:this.lessonNotes, activities:this.activities, studentNotes:this.studentNotes,
        savedAt:this.savedAt
      })
    },

    /* ===== 명단/출결 ===== */
    setRoster(subject, rows){ this.rosters[subject] = rows; this.persist() },
    clearRoster(subject){ delete this.rosters[subject]; this.persist() },
    setStatus(subject, date, studentId, status){
      if (!this.attendance[subject]) this.attendance[subject] = {}
      if (!this.attendance[subject][date]) this.attendance[subject][date] = {}
      this.attendance[subject][date][String(studentId)] = status
      this.persist()
    },
    clearDay(subject, date){
      if (this.attendance[subject]) delete this.attendance[subject][date]
      this.persist()
    },

    /* ===== 캘린더 ===== */
    addCalendar(subject, { date, title }){
      if (!this.calendars[subject]) this.calendars[subject] = []
      this.calendars[subject].unshift({ id: Date.now()+Math.random(), date, title })
      this.persist()
    },
    removeCalendar(subject, id){
      this.calendars[subject] = (this.calendars[subject]||[]).filter(x=>x.id!==id)
      this.persist()
    },

    /* ===== 체크리스트 ===== */
    addTask(subject, text){
      if (!this.tasks[subject]) this.tasks[subject] = []
      this.tasks[subject].unshift({ id: Date.now()+Math.random(), text, done:false })
      this.persist()
    },
    toggleTask(subject, id){
      const arr = this.tasks[subject] || []
      const i = arr.findIndex(x=>x.id===id)
      if (i>=0){ arr[i].done = !arr[i].done; this.persist() }
    },
    removeTask(subject, id){
      this.tasks[subject] = (this.tasks[subject]||[]).filter(x=>x.id!==id)
      this.persist()
    },
    clearDone(subject){
      this.tasks[subject] = (this.tasks[subject]||[]).filter(x=>!x.done)
      this.persist()
    },
    sortTasks(subject){
      this.tasks[subject] = [...(this.tasks[subject]||[])].sort((a,b)=> Number(a.done)-Number(b.done))
      this.persist()
    },

    /* ===== 평가계획 ===== */
    setEvalPlan(subject, text){
      this.evalPlan[subject] = { text: String(text||'') }
      this.persist()
    },

    /* ===== 진도표 ===== */
    addProgress(subject, { date, unit, memo }){
      if (!this.progress[subject]) this.progress[subject] = []
      this.progress[subject].unshift({ id: Date.now()+Math.random(), date, unit, memo })
      this.persist()
    },
    removeProgress(subject, id){
      this.progress[subject] = (this.progress[subject]||[]).filter(x=>x.id!==id)
      this.persist()
    },

    /* ===== 수업정리/노트 ===== */
    addLesson(subject, { date, text }){
      if (!this.lessonNotes[subject]) this.lessonNotes[subject] = []
      this.lessonNotes[subject].unshift({ id: Date.now()+Math.random(), date, text })
      this.persist()
    },
    removeLesson(subject, id){
      this.lessonNotes[subject] = (this.lessonNotes[subject]||[]).filter(x=>x.id!==id)
      this.persist()
    },

    /* ===== 학생 활동 기록 ===== */
    addActivity(subject, studentId, { datetime, content }){
      if (!this.activities[subject]) this.activities[subject] = {}
      if (!this.activities[subject][studentId]) this.activities[subject][studentId] = []
      this.activities[subject][studentId].unshift({ id: Date.now()+Math.random(), datetime, content })
      this.persist()
    },
    removeActivity(subject, studentId, id){
      const arr = this.activities[subject]?.[studentId] || []
      this.activities[subject][studentId] = arr.filter(x=>x.id!==id)
      this.persist()
    },

    /* ===== 학생별 특이사항 ===== */
    setStudentNote(subject, studentId, payload){
      if (!this.studentNotes[subject]) this.studentNotes[subject] = {}
      this.studentNotes[subject][studentId] = {
        attitude: payload.attitude || '',
        presentation: payload.presentation || '',
        participation: payload.participation || '',
        memo: payload.memo || ''
      }
      this.persist()
    }
  }
})
