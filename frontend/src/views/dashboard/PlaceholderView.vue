<template>
  <div class="placeholder-view">
    <el-empty description="该模块正在开发中，敬请期待">
      <el-button type="primary" @click="goBack">返回工作台</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.placeholder-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
