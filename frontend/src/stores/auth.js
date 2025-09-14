import { defineStore } from 'pinia'
import api from '@/lib/api'

async function sha256Hex(text){
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null, error: null }),
  getters: { isAuthenticated: s => !!s.user },
  actions: {
    async login(id, pw){
      this.error = null
      try{
        const { data } = await api.get(`/admin.json?t=${Date.now()}`)
        const ok = id === data.id && (await sha256Hex(pw)) === data.hashedPassword
        if(ok){ this.user = { id }; return true }
        this.error = '아이디 또는 비밀번호가 올바르지 않습니다.'; return false
      }catch(e){
        console.error(e); this.error = 'admin.json을 찾을 수 없습니다.'; return false
      }
    },
    logout(){ this.user = null }
  }
})
