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
  padding: 16px;
  border: 1px solid rgba(74, 111, 137, .38);
  border-radius: 8px;
  color: #d4e3ef;
  background: linear-gradient(180deg, rgba(13, 32, 46, .98), rgba(8, 25, 38, .98));
  box-shadow: inset 0 1px rgba(255,255,255,.03);
  overflow: hidden;
}

.kpi-head {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d5e5f4;
  font-size: 16px;
}

.kpi-head .el-icon {
  color: #36d9bb;
  font-size: 25px;
}

.kpi-body {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
}

.kpi-body strong {
  color: #fff;
  font-size: 31px;
}

.kpi-body span {
  color: #b6c7d5;
  font-size: 15px;
}

.kpi-foot {
  display: flex;
  gap: 18px;
  margin-top: 10px;
  color: #a9b7c6;
}

.kpi-foot b {
  color: #27e591;
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
  background: linear-gradient(145deg, transparent 45%, #2af0bf 47%, transparent 49%);
}

.mini-visual.ring {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 9px solid rgba(72, 211, 127, .25);
  border-right-color: #55e592;
  border-top-color: #55e592;
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
