<template>
  <div class="shidduch-layout" dir="rtl">
    <header class="shidduch-header">
      <button class="back-btn" @click="RoutePush">
        <span>חזור</span>
      </button>
      <div class="header-title">
        <h1>שידוכים</h1>
        <p class="subtitle">ניהול מועמדים והתאמות</p>
      </div>
    </header>

    <main class="shidduch-main">
      <containor />
    </main>
  </div>
</template>

<script>
import { onMounted } from "vue";
import containor from "@/components/Shiduh/ContainorComp.vue";
import router from "@/router";

export default {
  components: { containor },
  setup() {
    onMounted(() => {
      document.body.style.background =
        "radial-gradient(circle at center,#ffcf2273, #f9844581, #ffb9564c)";
    });

    const RoutePush = () => {
      router.push("/Admin");
    };

    return { RoutePush };
  },
};
</script>

<style lang="scss" scoped>
.shidduch-layout {
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

.shidduch-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.header-title {
  text-align: right;
  flex: 1;
}

h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 0.03em;
}

.subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.shidduch-main {
  max-width: 1200px;
  margin: 0 auto;
}

/* כפתור חזור – מודרני */
.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #3d405b;
  border: none;
  color: #ffffff;
  font-size: 0.95rem;
  padding: 0.5rem 1.3rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
}

.back-btn span {
  position: relative;
  padding-left: 0.5rem;
  transition: padding 0.3s ease;
}

/* האפקט שנתת – עם « */
.back-btn span:after {
  content: "«";
  position: absolute;
  opacity: 0;
  top: 0;
  left: -15px;
  transition: 0.3s;
}

.back-btn:hover span {
  padding-left: 15px;
}

.back-btn:hover span:after {
  opacity: 1;
  left: 0;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  background: #484b6e;
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

@media (max-width: 768px) {
  .shidduch-layout {
    padding: 0.75rem;
  }

  .shidduch-header {
    flex-direction: row-reverse;
    align-items: flex-start;
  }

  h1 {
    font-size: 1.4rem;
  }
}
</style>
