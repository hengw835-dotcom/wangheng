<template>
  <article class="kpi-card">
    <div class="kpi-head">
      <el-icon><component :is="iconComponent" /></el-icon>
      <span>{{ item.title }}</span>
    </div>
    <div class="kpi-body">
      <strong>{{ item.value }}</strong>
      <span>{{ item.unit }}</span>
      <div :class="['mini-visual', item.visual]"><i v-for="n in 8" :key="n"></i></div>
    </div>
    <div class="kpi-foot">
      <span>{{ item.sub }}</span>
      <b>{{ item.trend }}</b>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Connection, Cpu, Grid, Tickets, Van } from '@element-plus/icons-vue'

const props = defineProps({
  item: { type: Object, required: true }
})

const icons = { Clock, Connection, Cpu, Grid, Tickets, Van }
const iconComponent = computed(() => icons[props.item.icon] || Grid)
</script>

<style scoped>
.kpi-card {
  position: relative;
  min-width: 0;
  padding: 15px 16px;
  border: 1px solid rgba(104, 133, 158, .24);
  border-radius: 8px;
  color: #d4e3ef;
  background:
    linear-gradient(180deg, rgba(16, 39, 55, .97), rgba(8, 24, 36, .98)),
    #0a1c2a;
  box-shadow:
    inset 0 1px rgba(255,255,255,.05),
    0 14px 30px rgba(0, 0, 0, .12);
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(38, 225, 160, .72), rgba(59, 130, 246, .18));
}

.kpi-head {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #bdd0df;
  font-size: 14px;
}

.kpi-head .el-icon {
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border-radius: 7px;
  color: #37e3b0;
  background: rgba(38, 225, 160, .1);
  font-size: 18px;
}

.kpi-body {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 13px;
}

.kpi-body strong {
  color: #fff;
  font-size: 32px;
  font-weight: 850;
  line-height: 1;
}

.kpi-body span {
  color: #90a4b6;
  font-size: 15px;
}

.kpi-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 12px;
  color: #92a7b9;
  font-size: 13px;
}

.kpi-foot b {
  padding: 2px 7px;
  border-radius: 99px;
  color: #7df0ae;
  background: rgba(34, 197, 94, .1);
  font-weight: 750;
}

.mini-visual {
  position: absolute;
  right: 18px;
  bottom: 20px;
}

.mini-visual.spark,
.mini-visual.line-mini {
  width: 78px;
  height: 30px;
  border-bottom: 1px solid rgba(77, 255, 204, .12);
  opacity: .78;
  background: linear-gradient(145deg, transparent 45%, #4ade80 47%, transparent 49%);
}

.mini-visual.ring {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 9px solid rgba(72, 211, 127, .18);
  border-right-color: #5ee48f;
  border-top-color: #5ee48f;
  opacity: .86;
}

.mini-visual.bars {
  display: flex;
  align-items: end;
  gap: 5px;
  height: 56px;
}

.mini-visual.bars i {
  width: 7px;
  background: #21bd72;
}

.mini-visual.bars.yellow i {
  background: #c6b335;
}

.mini-visual.bars i:nth-child(1) { height: 18px; }
.mini-visual.bars i:nth-child(2) { height: 30px; }
.mini-visual.bars i:nth-child(3) { height: 46px; }
.mini-visual.bars i:nth-child(4) { height: 54px; }
.mini-visual.bars i:nth-child(5) { height: 38px; }
.mini-visual.bars i:nth-child(6) { height: 62px; }
.mini-visual.bars i:nth-child(7) { height: 50px; }
.mini-visual.bars i:nth-child(8) { height: 42px; }
</style>
