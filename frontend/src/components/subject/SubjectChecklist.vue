<template>
  <section class="card" style="padding:12px;">
    <Checklist
      :title="`할일목록 (${subject})`"
      :items="items"
      :allowAdd="true"
      placeholder="수업 관련 할 일을 입력하세요"
      @add="add"
      @toggle="toggle"
      @remove="removeItem"
      @clearDone="clearDone"
      @sort="sort"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import Checklist from '@/components/Checklist.vue'
import { useSubjectsStore } from '@/stores/subjects'
const props = defineProps({ subject: { type:String, required:true } })
const store = useSubjectsStore()

const items = computed(()=> store.taskList(props.subject))
function add(t){ store.addTask(props.subject, t) }
function toggle(id){ store.toggleTask(props.subject, id) }
function removeItem(id){ store.removeTask(props.subject, id) }
function clearDone(){ store.clearDone(props.subject) }
function sort(){ store.sortTasks(props.subject) }
</script>
