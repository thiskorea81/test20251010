// 성별 표준화 & 판별 유틸
export function normalizeGender(value) {
    const s = String(value ?? '').trim().toLowerCase()
    if (['여', '여성', '여자', 'female', 'f', 'girl'].includes(s)) return '여'
    if (['남', '남성', '남자', 'male', 'm', 'boy'].includes(s)) return '남'
    return (value ?? '')
  }
  
  export function isFemaleValue(value) {
    return normalizeGender(value) === '여'
  }
  