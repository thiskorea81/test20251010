<template>
  <h2 style="margin:0 0 12px;">관리자</h2>
  <AdminSettings />
  <BackupRestore />
  <StudentUpload />
</template>

<script setup>
import AdminSettings from '@/components/AdminSettings.vue'
import BackupRestore from '@/components/BackupRestore.vue'
import StudentUpload from '@/components/StudentUpload.vue'
</script>
