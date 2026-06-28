<template>
  <table class="dashboard-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!items.length">
        <td :colspan="columns.length" class="empty-cell">{{ emptyText }}</td>
      </tr>
      <tr v-for="row in items" :key="rowKey(row)">
        <td v-for="column in columns" :key="column.key">
          <slot :name="column.key" :row="row">
            {{ row[column.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, default: () => [] },
  emptyText: { type: String, default: '暂无数据' }
})

function rowKey(row) {
  return row.id || `${row.time}-${row.device}-${row.type}`
}
</script>

<style scoped>
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  height: 33px;
  border-bottom: 1px solid rgba(102, 131, 155, .14);
  color: #c4d3df;
  text-align: left;
}

th {
  height: 30px;
  color: #8da1b2;
  background: rgba(144, 163, 184, .06);
  font-weight: 650;
}

td:first-child,
th:first-child {
  padding-left: 10px;
}

tbody tr:hover td {
  background: rgba(38, 225, 160, .045);
}

.empty-cell {
  color: #71879a;
  text-align: center;
}
</style>
