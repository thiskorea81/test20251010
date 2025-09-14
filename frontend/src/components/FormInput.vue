<template>
    <label style="display:block;">
      <span v-if="label" style="display:inline-block;font-size:14px;color:var(--muted);margin-bottom:6px;">
        {{ label }}
      </span>
      <input
        :type="type"
        class="input"
        :placeholder="placeholder"
        v-model="model"
        @keyup.enter="$emit('enter')"
      />
    </label>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  const props = defineProps({
    label: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    modelValue: [String, Number],
  })
  const emit = defineEmits(['update:modelValue', 'enter'])
  const model = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
  })
  </script>
  