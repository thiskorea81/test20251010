// src/stores/subjects.js
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
    // ===== 명단/출결 =====
    rosters: {},      // { subjectName: [ {학생개인번호, 성명, 학년, 반, 번호} ] }
    attendance: {},   // { subjectName: { 'YYYY-MM-DD': { studentId: 'present|absent|late|early' } } }

    // ===== 수업 캘린더(간단 메모) =====
    calendars: {},    // { subjectName: [ {id, date, title} ] }

    // ===== 체크리스트 =====
    tasks: {},        // { subjectName: [ {id, text, done} ] }

    // ===== 평가계획 =====
    evalPlan: {},     // { subjectName: { text: '' } }

    // ===== 진도표 =====
    progress: {},     // { subjectName: [ {id, date, unit, memo} ] }

    // ===== 수업정리/노트(수업 후 교사 기록) =====
    lessonNotes: {},  // { subjectName: [ {id, date, text} ] }

    // ===== 학생 활동 기록(수업 중 활동 메모) =====
    activities: {},   // { subjectName: { studentId: [ {id, datetime, content} ] } }

    // ===== 학생별 특이사항 (레거시: 단일 메모) =====
    // 출결 표에서 "저장"으로 간단 1건만 빠르게 남길 때 사용
    studentNotes: {}, // { subjectName: { studentId: { attitude, presentation, participation, memo } } }

    // ✅ 학생별 특이사항 (신규: 누적 기록 배열)
    // "자세히" 페이지에서 여러 건을 시간순으로 기록/수정/삭제
    notesBySubject: {}, // { subjectName: { studentId: [ {id, datetime, attitude, presentation, participation, memo} ] } }

    savedAt: null,
  }),
  getters: {
    // --- 명단/출결 ---
    roster:      (s) => (subject)      => s.rosters[subject] || [],
    dayMap:      (s) => (subject, date)=> (s.attendance[subject]?.[date] || {}),

    // --- 캘린더/체크리스트/진도/수업정리 ---
    taskList:    (s) => (subject)      => s.tasks[subject] || [],
    calList:     (s) => (subject)      => s.calendars[subject] || [],
    progressList:(s) => (subject)      => s.progress[subject] || [],
    lessonList:  (s) => (subject)      => s.lessonNotes[subject] || [],

    // --- 활동/특이사항(레거시 단일) ---
    actListByStudent: (s) => (subject, id) => (s.activities[subject]?.[id] || []),
    studentNote:      (s) => (subject, id) => (s.studentNotes[subject]?.[id] || { attitude:'', presentation:'', participation:'', memo:'' }),

    // ✅ 특이사항(누적 배열) 목록
    listNotes: (s) => (subject, id) => {
      const arr = (s.notesBySubject[subject]?.[id]) || []
      // 최신이 위로 오도록 정렬 (datetime desc)
      return [...arr].sort((a,b) => (a.datetime > b.datetime ? -1 : 1))
    },
  },
  actions: {
    init() {
      const data = load()
      if (data) Object.assign(this, data)

      // (선택) 간단 마이그레이션: 필요 시 레거시 단일 메모를 첫 기록으로 옮길 수 있음
      // 여기선 자동 변환하지 않고, 두 체계를 병행 지원합니다.
      // 주석 해제 시 1회성 변환 로직을 넣을 수 있어요.
      // this._migrateSingleNoteToList()
    },
    persist() {
      this.savedAt = new Date().toISOString()
      save({
        rosters: this.rosters,
        attendance: this.attendance,
        calendars: this.calendars,
        tasks: this.tasks,
        evalPlan: this.evalPlan,
        progress: this.progress,
        lessonNotes: this.lessonNotes,
        activities: this.activities,
        studentNotes: this.studentNotes,
        notesBySubject: this.notesBySubject, // ✅ 신규 필드 저장
        savedAt: this.savedAt
      })
    },

    /* ===== 명단/출결 ===== */
    setRoster(subject, rows){
      this.rosters[subject] = Array.isArray(rows) ? rows : []
      this.persist()
    },
    clearRoster(subject){
      delete this.rosters[subject]
      this.persist()
    },
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
      const t = String(text||'').trim()
      if (!t) return
      if (!this.tasks[subject]) this.tasks[subject] = []
      this.tasks[subject].unshift({ id: Date.now()+Math.random(), text: t, done:false })
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

    /* ===== 학생별 특이사항 (레거시 단일: 출결표 인라인 저장용) ===== */
    setStudentNote(subject, studentId, payload){
      if (!this.studentNotes[subject]) this.studentNotes[subject] = {}
      this.studentNotes[subject][studentId] = {
        attitude: payload.attitude || '',
        presentation: payload.presentation || '',
        participation: payload.participation || '',
        memo: payload.memo || ''
      }
      this.persist()
    },

    /* ===== 학생별 특이사항 (신규: 누적 기록 배열) ===== */
    _ensureNoteArr(subject, studentId){
      if (!this.notesBySubject[subject]) this.notesBySubject[subject] = {}
      if (!this.notesBySubject[subject][studentId]) this.notesBySubject[subject][studentId] = []
      return this.notesBySubject[subject][studentId]
    },
    addNote(subject, studentId, { datetime, attitude='', presentation='', participation='', memo='' }){
      const arr = this._ensureNoteArr(subject, String(studentId))
      arr.unshift({
        id: Date.now() + Math.random(),
        datetime,
        attitude,
        presentation,
        participation,
        memo,
      })
      this.persist()
    },
    updateNote(subject, studentId, noteId, patch){
      const arr = this._ensureNoteArr(subject, String(studentId))
      const i = arr.findIndex(x => x.id === noteId)
      if (i >= 0){
        arr[i] = { ...arr[i], ...patch }
        this.persist()
      }
    },
    removeNote(subject, studentId, noteId){
      const sid = String(studentId)
      const arr = this._ensureNoteArr(subject, sid)
      this.notesBySubject[subject][sid] = arr.filter(x => x.id !== noteId)
      this.persist()
    },
    clearNotes(subject, studentId){
      if (this.notesBySubject[subject]?.[studentId]){
        this.notesBySubject[subject][studentId] = []
        this.persist()
      }
    },

    /*
    //(선택) 1회성 마이그레이션: 레거시 단일 메모를 첫 기록으로 승격
    _migrateSingleNoteToList(){
      const subjKeys = Object.keys(this.studentNotes || {})
      let changed = false
      for (const sub of subjKeys){
        const byStu = this.studentNotes[sub] || {}
        for (const sid of Object.keys(byStu)){
          const v = byStu[sid]
          if (!v) continue
          const hasList = (this.notesBySubject[sub]?.[sid] || []).length > 0
          if (!hasList){
            this._ensureNoteArr(sub, sid).unshift({
              id: Date.now()+Math.random(),
              datetime: new Date().toISOString().slice(0,16).replace('T',' '),
              attitude: v.attitude || '',
              presentation: v.presentation || '',
              participation: v.participation || '',
              memo: v.memo || '',
            })
            changed = true
          }
        }
      }
      if (changed) this.persist()
    }
    */
  }
})
