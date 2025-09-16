import { defineStore } from 'pinia'
import { normalizeGender } from '@/utils/gender'

function pickId(row) {
  // 새 포맷 우선, 없으면 기존 학번 사용
  return String(row['학생개인번호'] ?? row['학번'] ?? '').trim()
}

function normalizeRow(raw) {
  const r = { ...raw }

  // 이름/성명 호환
  if (r['성명'] == null && r['이름'] != null) r['성명'] = r['이름']
  if (r['이름'] == null && r['성명'] != null) r['이름'] = r['성명'] // 기존 화면 호환

  // 학생개인번호=학번 호환
  if (r['학생개인번호'] == null && r['학번'] != null) r['학생개인번호'] = r['학번']

  // 숫자/문자 정리
  if (r['학년'] != null) r['학년'] = Number(r['학년'])
  if (r['반'] != null) r['반'] = Number(r['반'])
  if (r['번호'] != null) r['번호'] = Number(r['번호'])

  // 성별 표준화(남/여)
  if (r['성별'] != null) r['성별'] = normalizeGender(r['성별'])

  // 기본 필드 보장
  return {
    '학생개인번호': pickId(r),
    '학년' : r['학년'] ?? '',
    '반'   : r['반'] ?? '',
    '번호' : r['번호'] ?? '',
    '성명' : (r['성명'] ?? '').toString(),
    '이름' : (r['이름'] ?? r['성명'] ?? '').toString(), // 화면 호환
    '성별' : r['성별'] ?? '',
    '생년월일': r['생년월일'] ?? '',
    '주소' : r['주소'] ?? '',
    '비고' : r['비고'] ?? '',
    '연락처': r['연락처'] ?? '',
    '보호자1연락처': r['보호자1연락처'] ?? '',
    '보호자2연락처': r['보호자2연락처'] ?? '',
  }
}

export const useStudentsStore = defineStore('students', {
  state: () => ({
    // 주키: 학생개인번호
    // [{ 학생개인번호, 학년, 반, 번호, 성명, 성별, 생년월일, 주소, 비고, 연락처, 보호자1연락처, 보호자2연락처, (이름: 호환용) }]
    list: []
  }),
  getters: {
    byId: (s) => (id) => s.list.find(stu => String(stu['학생개인번호']) === String(id)),
  },
  actions: {
    addMany(rows) {
      const normalized = rows
        .map(normalizeRow)
        .filter(r => r['학생개인번호']) // id 없는 행은 스킵
      this.list.push(...normalized)
    },
    clear() {
      this.list = []
    },
    update(id, patch = {}) {
      const key = String(id)
      this.list = this.list.map(stu => {
        if (String(stu['학생개인번호']) !== key) return stu
        const next = normalizeRow({ ...stu, ...patch })
        return next
      })
    }
  }
})
