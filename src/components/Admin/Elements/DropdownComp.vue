<template>
  <div class="actions-dropdown" dir="rtl">
    <button type="button" class="actions-dropdown__trigger" @click="toggleOpen">
      <span>אפשרויות</span>
      <i
        class="fa-solid fa-chevron-down actions-dropdown__chevron"
        :class="{ 'is-open': isOpen }"
      ></i>
    </button>

    <transition name="actions-dropdown-fade">
      <div v-if="isOpen" class="actions-dropdown__menu">
        <button
          type="button"
          class="actions-dropdown__item"
          @click="Evnent('Shiduh')"
        >
          <span class="actions-dropdown__item-text">
            <i class="fa-light fa-restroom"></i>
            התחל לשדך
          </span>
        </button>

        <!-- <button
          type="button"
          class="actions-dropdown__item"
          @click="Evnent('Update')"
        >
          <span class="actions-dropdown__item-text">
            <i class="fa-duotone fa-pen-to-square"></i>
            עדכן
          </span>
        </button> -->

        <button
          type="button"
          class="actions-dropdown__item"
          @click="Evnent('Delete')"
        >
          <span class="actions-dropdown__item-text">
            <i class="fa-duotone fa-trash"></i>
            מחיקה
          </span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  setup(props, { emit }) {
    const router = useRouter();
    const isOpen = ref(false);
    const store = useStore();

    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };

    const Evnent = (val) => {
      isOpen.value = false;
      if (typeof val === "string" && val === "Shiduh") {
        router.push(`/${val}`);
      } else if (val === "Delete") {
        store.commit("UpdateState", { Delete: true });
      } else if (val === "Update") {
        store.commit("UpdateState", { Update: true });
      }
    };

    return {
      isOpen,
      toggleOpen,
      Evnent,
    };
  },
};
</script>

<style lang="scss" scoped>
$bg-dark: #020617;
$bg-card: #0b1220;
$accent-gold: #fbbf24;
$accent-pink: #f97373;
$accent-purple: #8b5cf6;
$text-main: #f9fafb;
$text-muted: #9ca3af;

// עטיפה כללית
.actions-dropdown {
  position: relative;
  display: inline-block;
  direction: rtl;
  font-family: inherit;
}

// כפתור פתיחה
.actions-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: $text-main;
  background: linear-gradient(135deg, $accent-purple, $accent-pink);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;

  span {
    position: relative;
    top: 1px;
  }

  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.7);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6);
  }
}

// אייקון החץ
.actions-dropdown__chevron {
  font-size: 0.7rem;
  transition: transform 0.18s ease;
}

.actions-dropdown__chevron.is-open {
  transform: rotate(180deg);
}

// תפריט
.actions-dropdown__menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  min-width: 190px;
  padding: 0.4rem;
  border-radius: 12px;
  background: radial-gradient(circle at 0% 0%, #1e293b, transparent 60%),
    radial-gradient(circle at 100% 0%, #4b5563aa, transparent 60%),
    linear-gradient(145deg, #020617, #0b1220);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.4);
  z-index: 40;
}

// פריט בתפריט
.actions-dropdown__item {
  width: 100%;
  border: none;
  background: transparent;
  color: $text-main;
  text-align: right;
  padding: 0.45rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.12s ease, transform 0.08s ease;

  &:not(:last-child) {
    margin-bottom: 0.15rem;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(248, 250, 252, 0.06),
      rgba(148, 163, 184, 0.12)
    );
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.actions-dropdown__item-text {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  i {
    font-size: 0.8rem;
    color: $accent-gold;
  }
}

// אנימציה לכניסה/יציאה
.actions-dropdown-fade-enter-active,
.actions-dropdown-fade-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.actions-dropdown-fade-enter-from,
.actions-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

// מובייל – קצת פחות צללה ויותר קליק־פראינדלי
@media (max-width: 480px) {
  .actions-dropdown__trigger {
    padding: 0.35rem 0.8rem;
    font-size: 0.78rem;
  }

  .actions-dropdown__menu {
    min-width: 170px;
    right: 50%;
    transform: translateX(50%);
  }
}
</style>
