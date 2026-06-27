<template>
  <router-view v-if="authStore.token" />
  <main v-else class="login-page">
    <form class="login-card" @submit.prevent="login">
      <span class="eyebrow">SMART HARVESTER SECURITY</span>
      <h1>登录云禾智控</h1>
      <p>使用管理员、调度员、驾驶员或只读账号登录平台。</p>

      <label>
        用户名
        <input v-model.trim="username" autocomplete="username" required />
      </label>

      <label>
        密码
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? '正在验证...' : '安全登录' }}
      </button>
      <small v-if="authStore.error">{{ authStore.error }}</small>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from './store'

const authStore = useAuthStore()
const username = ref('admin')
const password = ref('20031107')

async function login() {
  await authStore.login(username.value, password.value)
  password.value = ''
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}

.login-page {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 0%, rgba(35, 140, 255, 0.24), transparent 38%),
    linear-gradient(180deg, #061827, #020b14);
}

.login-card {
  width: min(420px, 100%);
  display: grid;
  gap: 18px;
  padding: 34px;
  color: #dcecff;
  background: rgba(7, 25, 42, 0.96);
  border: 1px solid rgba(66, 137, 199, 0.45);
  border-radius: 14px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
}

.login-card .eyebrow {
  color: #36c2ff;
  font-size: 11px;
  letter-spacing: .16em;
}

.login-card h1 {
  font-size: 26px;
}

.login-card p {
  color: #9eb6cf;
  line-height: 1.6;
}

.login-card label {
  display: grid;
  gap: 8px;
  color: #b9cce3;
}

.login-card input {
  height: 44px;
  padding: 0 12px;
  color: #fff;
  background: #03111f;
  border: 1px solid rgba(66, 137, 199, 0.48);
  border-radius: 7px;
}

.login-card button {
  height: 44px;
  color: #fff;
  background: #238cff;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.login-card button:disabled {
  opacity: .55;
  cursor: wait;
}

.login-card small {
  color: #ff7d89;
}
</style>
