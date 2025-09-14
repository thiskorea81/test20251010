<template>
    <div
      style="
        display:grid;
        grid-template-columns:240px 1fr;
        grid-template-rows:56px calc(100vh - 56px);
        grid-template-areas:'header header' 'sidebar main';
        height:100vh;
      "
    >
      <!-- 헤더 -->
      <header
        style="grid-area:header;background:#fff;
               border-bottom:1px solid var(--border);
               display:flex;align-items:center;
               justify-content:space-between;padding:0 12px;"
      >
        <strong @click="go('/diary')" style="cursor:pointer">교사 다이어리</strong>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn" @click="go('/admin')">관리자</button>
          <button class="btn" @click="onLogout">로그아웃</button>
        </div>
      </header>
  
      <!-- 사이드 메뉴 -->
      <aside
        style="grid-area:sidebar;background:#fff;
               border-right:1px solid var(--border);padding:12px;
               display:flex;flex-direction:column;gap:8px;"
      >
        <button class="btn" @click="go('/diary')">다이어리</button>
        <button class="btn" @click="go('/homeroom')">담임학급</button>
        <button class="btn" @click="go('/subject')">교과</button>
        <button class="btn" @click="go('/task')">업무</button>
      </aside>
  
      <!-- 메인 -->
      <main style="grid-area:main;padding:16px;overflow:auto;">
        <div class="container">
          <div class="card" style="padding:16px;">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  
  const auth = useAuthStore()
  const router = useRouter()
  
  function go(path) {
    router.push(path)
  }
  
  function onLogout() {
    auth.logout()
    router.push({ name: 'login' })
  }
  </script>
  