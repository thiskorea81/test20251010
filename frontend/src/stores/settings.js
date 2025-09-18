import { defineStore } from 'pinia'

const KEY = 'settings_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    grade: null,      // 1~6
    classNo: null,    // 1~15
    subjects: [],     // ['수학','정보', ...]
    works: [],        // ✅ ['학예회','방과후','행정', ...]  (신규)
    savedAt: null,    // 저장시각
  }),
  getters: {
    hasHomeroom: (s) => Number(s.grade) > 0 && Number(s.classNo) > 0,
  },
  actions: {
    /* 초기화/영구화 */
    init(){
      const v = load()
      if (v) Object.assign(this, v)
    },
    persist(){
      this.savedAt = new Date().toISOString()
      save({
        grade: this.grade,
        classNo: this.classNo,
        subjects: this.subjects,
        works: this.works,
        savedAt: this.savedAt
      })
    },

    /* 담임 */
    setGrade(v){ this.grade = Number(v) || null; this.persist() },
    setClassNo(v){ this.classNo = Number(v) || null; this.persist() },

    /* 교과 */
    addSubject(name){
      const t = String(name||'').trim()
      if (!t) return
      if (!this.subjects.includes(t)) { this.subjects.push(t); this.persist() }
    },
    removeSubject(name){
      this.subjects = this.subjects.filter(s => s !== name)
      this.persist()
    },

    /* ✅ 업무 */
    addWork(name){
      const t = String(name||'').trim()
      if (!t) return
      if (!this.works.includes(t)) { this.works.push(t); this.persist() }
    },
    removeWork(name){
      this.works = this.works.filter(s => s !== name)
      this.persist()
    }
  }
})
