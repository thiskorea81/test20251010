<template>
    <div class="container" style="display:grid;place-items:center;min-height:100vh;">
      <div class="card" style="padding:24px;width:min(420px,100%);">
        <h2 style="margin:0 0 12px;">관리자 로그인</h2>
  
        <div class="grid" style="gap:12px;">
          <label>
            <span class="label">아이디</span>
            <input class="input" v-model="id" placeholder="admin" />
          </label>
          <label>
            <span class="label">비밀번호</span>
            <input type="password" class="input" v-model="pw" placeholder="********" />
          </label>
  
          <button class="btn primary" @click="onLogin">로그인</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const id = ref('')
const pw = ref('')
const loading = ref(false)

async function onLogin(){
  if (loading.value) return
  loading.value = true
  const ok = await auth.login(id.value.trim(), pw.value)
  loading.value = false
  if (ok){
    const to = route.query.redirect || '/'
    router.replace(to)
  }
}
</script>
