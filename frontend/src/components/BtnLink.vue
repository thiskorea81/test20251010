<template>
  <button type="button" class="btn" @click="go"><slot /></button>
</template>

<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  to: { type: [String, Object], required: true }
})
const router = useRouter()
function go(){ router.push(props.to) }
</script>
