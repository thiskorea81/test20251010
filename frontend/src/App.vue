<!-- src/App.vue -->

<!-- 템플릿 영역: 앱의 전체적인 구조를 담당합니다. -->
<template>
  <!-- <div id="app-container">는 앱 전체를 감싸는 최상위 컨테이너입니다. -->
  <div id="app-container">
    
    <!-- <header>는 모든 페이지에서 공통으로 보여질 상단 영역입니다. -->
    <header class="app-header">
      <div class="logo">
        <!-- '/' 경로로 이동하는 로고 링크입니다. 클릭하면 홈페이지로 갑니다. -->
        <router-link to="/">교사 다이어리</router-link>
      </div>
      
      <!-- <nav>는 페이지 이동 링크들을 묶어주는 내비게이션 영역입니다. -->
      <nav class="main-nav">
        <!-- 
          <router-link>는 Vue Router에서 제공하는 링크 컴포넌트입니다.
          'to' 속성에 지정된 경로로 페이지를 새로고침 없이 부드럽게 이동시켜 줍니다.
        -->
        <router-link to="/diary">업무일지</router-link>
        <router-link to="/todos">할일목록</router-link>
        <router-link to="/students">학생관리</router-link>
        <router-link to="/classes">수업관리</router-link>
        <router-link to="/subject-specifics">과세특</router-link>
      </nav>
    </header>

    <!-- 
      <main> 영역은 실제 페이지의 내용이 보여지는 부분입니다.
      <router-view />는 현재 URL에 맞는 페이지 컴포넌트가 렌더링되는 '자리'입니다.
      예: /students 로 접속하면 StudentManagementPage.vue가 이 자리에 나타납니다.
    -->
    <main class="main-content">
      <router-view />
    </main>

  </div>
</template>

<!-- 
  스크립트 영역
  App.vue는 전체적인 레이아웃만 담당하므로, 특별한 로직이 필요 없어 비워둡니다.
  모든 기능은 각 페이지 컴포넌트(views 폴더 안의 파일들)에서 개별적으로 처리됩니다.
-->
<script setup>
  // 이 컴포넌트 자체의 로직은 없습니다.
</script>

