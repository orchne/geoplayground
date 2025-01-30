<script lang="ts" setup>
defineProps<{
  title: string;
}>();

const isSectionOpen = ref(false);

const openSection = () => {
  isSectionOpen.value = !isSectionOpen.value;
};
</script>

<template>
  <div class="space-y-4">
    <UDivider size="xs" />
    <div class="flex justify-between items-center">
      <h2 class="font-semibold text-sm">{{ title }}</h2>
      <div class="cursor-pointer" @click="openSection">-</div>
    </div>
    <div v-if="isSectionOpen">
      <slot />
    </div>
  </div>
</template>

<style></style>
