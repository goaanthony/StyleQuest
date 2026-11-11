<template>
  <div class="bento-card widget-card" :class="cardClass">
    <div class="widget-icon" :class="iconClass">{{ icon }}</div>
    <div class="widget-info">
      <span class="widget-value" :class="valClass">{{ value }}</span>
      <span class="widget-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    icon: string
    value: number | string
    label: string
    variant?: 'streak' | 'xp' | 'record' | 'lesson' | 'default'
  }>(),
  {
    variant: 'default',
  }
)

const cardClass = computed(() => {
  if (props.variant === 'streak') return 'card-streak'
  if (props.variant === 'xp') return 'card-xp'
  return ''
})

const iconClass = computed(() => {
  if (props.variant === 'streak') return 'streak-icon'
  if (props.variant === 'record') return 'record-icon'
  if (props.variant === 'xp') return 'xp-icon'
  if (props.variant === 'lesson') return 'lesson-icon'
  return ''
})

const valClass = computed(() => {
  if (props.variant === 'streak') return 'streak-val'
  if (props.variant === 'record') return 'record-val'
  if (props.variant === 'xp') return 'xp-val'
  if (props.variant === 'lesson') return 'lesson-val'
  return ''
})
</script>

<style scoped>
.widget-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 0 #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.widget-icon {
  font-size: 2.5rem;
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.widget-info {
  display: flex;
  flex-direction: column;
}

.widget-value {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
  color: #0f172a;
}

.widget-label {
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 0.3rem;
  letter-spacing: 0.05em;
}

/* Couleurs spécifiques aux variantes */
.streak-icon { background: #fff8e1; border-color: #ffe082; }
.streak-val, .card-streak .widget-value { color: #ff9600; }

.record-icon { background: #fef3c7; border-color: #fde68a; }
.record-val { color: #fbbf24; }

.xp-icon { background: #e8f7fe; border-color: #bae6fd; }
.xp-val, .card-xp .widget-value { color: #1cb0f6; }

.lesson-icon { background: #f0fdf4; border-color: #bbf7d0; }
.lesson-val { color: #58cc02; }
</style>
