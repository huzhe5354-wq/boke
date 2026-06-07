<template>
  <div class="home">

    <!-- Hero区（你原来的） -->
    <section class="hero">
      <h1>欢迎来到我的作品集</h1>
    </section>

    <!-- About区（你原来的） -->
    <section class="about">
      <h2>关于我</h2>
    </section>

    <!-- ⭐这里就是你要加的 -->
    <ProjectSection />

    <!-- Contact区（你原来的） -->
    <section class="contact">
      <h2>联系我</h2>
    </section>

  </div>
</template>

<script setup>
import ProjectSection from "@/components/ProjectSection.vue";
</script>

<style scoped>
.home {
  background: #0d0d0d;
  color: white;
}
</style>