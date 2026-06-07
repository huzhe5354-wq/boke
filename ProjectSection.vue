<template>
  <section class="project-section">
    <h2 class="title">项目作品</h2>

    <div class="project-grid">
      <div
          class="project-card"
          v-for="item in projects"
          :key="item.id"
      >
        <div class="img-box">
          <img :src="item.imageUrl || defaultImg" />
        </div>

        <div class="content">
          <h3>{{ item.projectTitle }}</h3>
          <p>{{ item.projectDescription }}</p>

          <div class="tags">
            <span
                v-for="(t, index) in splitTech(item.techStack)"
                :key="index"
            >
              {{ t }}
            </span>
          </div>

          <div class="actions">
            <a :href="item.githubUrl" target="_blank">GitHub</a>
            <a :href="item.demoUrl" target="_blank">Demo</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getProjectList } from "@/api/project";

const projects = ref([]);

const defaultImg =
    "https://via.placeholder.com/400x250?text=Project";

const splitTech = (str) => {
  if (!str) return [];
  return str.split(" ");
};

const loadData = async () => {
  try {
    const res = await getProjectList();
    projects.value = res.data;
  } catch (e) {
    console.error("项目加载失败", e);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.project-section {
  padding: 80px 10%;
  background: #0d0d0d;
  color: #fff;
}

.title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
  letter-spacing: 2px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.project-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  transition: 0.3s;
  backdrop-filter: blur(10px);
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
}

.img-box img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.content {
  padding: 16px;
}

.content h3 {
  margin: 0 0 10px;
}

.content p {
  font-size: 14px;
  opacity: 0.8;
  min-height: 40px;
}

.tags {
  margin: 10px 0;
}

.tags span {
  display: inline-block;
  font-size: 12px;
  padding: 3px 8px;
  margin-right: 5px;
  background: rgba(255, 215, 0, 0.15);
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.actions a {
  flex: 1;
  text-align: center;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 215, 0, 0.2);
  color: #fff;
  text-decoration: none;
  transition: 0.2s;
}

.actions a:hover {
  background: rgba(255, 215, 0, 0.5);
}
</style>