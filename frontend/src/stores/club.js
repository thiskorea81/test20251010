import { defineStore } from 'pinia'

export const useClubStore = defineStore('club', {
  state: () => ({
    rows: [],        // [{ No, 학생개인번호, 성명, 학년, 반, 번호 }]
    infoText: '',    // 파일/시트 정보 표시용
  }),
  actions: {
    setRoster(rows, infoText = '') {
      this.rows = rows
      this.infoText = infoText
    },
    clear() {
      this.rows = []
      this.infoText = ''
    }
  }
})
