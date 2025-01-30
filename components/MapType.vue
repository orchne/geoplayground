<script lang="ts" setup>
const props = defineProps<{
  label: string;
  icon: string;
  isActive: boolean;
  available: boolean;
}>();
</script>

<template>
  <div
    class="flex flex-col text-center outline outline-1 outline-gray-200 py-2 px-4 shadow-md rounded-md"
    :class="{
      'bg-blue-100 border-blue-500 text-blue-400 ': isActive, // Selected state (Blue)
      'bg-gray-100 text-gray-400 cursor-not-allowed': !available, // Unavailable (Gray)
      'hover:bg-blue-50 cursor-pointer transition-colors duration-300 ease-in-out':
        available && !isActive, // Hover effect if available
    }"
  >
    <div class="logo">
      <UIcon :name="props.icon" class="w-7 h-7 text-blue-400" />
    </div>
    <div class="title text-sm">{{ props.label }}</div>
  </div>
</template>

<style></style>
