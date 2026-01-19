<template>
  <div
    class="grid-wrapper"
    :class="{ 'grid-wrapper--delete-mode': isDelete }"
    dir="rtl"
  >
    <!-- מצב טעינה -->
    <div v-if="!isFinished" class="grid-loading">
      <div class="grid-loading__spinner"></div>
      <div class="grid-loading__text">טוען נתונים...</div>
    </div>

    <!-- מצב נתונים -->
    <div v-else class="grid-container">
      <template v-if="data && data.length">
        <div class="grid">
          <div
            v-for="(Item, i) in data"
            :key="Item._id || i"
            class="grid__item"
          >
            <article
              class="profile-card"
              :class="{
                'profile-card-DeleteMode': isDelete,
                'profile-card--male': Item.Gender === 'זכר',
                'profile-card--female': Item.Gender === 'נקבה',
              }"
              @click="GetPratim(Item._id)"
            >
              <div
                v-if="isDelete"
                class="delete-x"
                @click="DelteUser(Item._id)"
              >
                <i class="fa-solid fa-xmark"></i>
              </div>

              <div class="profile-card__image-wrapper">
                <img
                  :src="Item.picURL || '/Logo.jpg'"
                  alt="תמונה"
                  class="profile-card__image"
                  @error="(e) => (e.target.src = '/Logo.jpg')"
                />
              </div>

              <div class="profile-card__body">
                <h3 class="profile-card__title">
                  {{ Item.Name || "ללא שם" }}
                  <span v-if="Item.Age" class="profile-card__age">
                    / {{ Item.Age }}
                  </span>
                </h3>

                <p v-if="Item.RamaDatit" class="profile-card__subtitle">
                  {{ Item.RamaDatit }}
                </p>

                <button
                  v-show="!isDelete"
                  type="button"
                  class="profile-card__button"
                  @click.stop="GetPratim(Item._id)"
                >
                  מידע נוסף
                </button>
              </div>
            </article>
          </div>
        </div>
      </template>

      <!-- כשאין בכלל נתונים -->
      <div v-else class="grid-empty">
        <p class="grid-empty__text">לא נמצאו תוצאות בהתאם לסינון.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import "@/views/cssOfRedyElements.scss";
import { useStore } from "vuex";

export default {
  props: ["data"],
  setup(props, { emit }) {
    const Store = useStore();

    const GetPratim = (id) => {
      emit("GetPratim", id);
    };
    const DelteUser = (id) => {
      emit("DelteUser", id);
    };
    const isDelete = computed(() => Store.state.isDelete);
    const isUpdate = computed(() => Store.state.isUpdate);

    const isFinished = computed(() => Store.state.isFinished);

    return { isFinished, GetPratim, isUpdate, isDelete, DelteUser };
  },
};
</script>

<style lang="scss" scoped>
$card-bg1: #1d0624;
$card-bg2: #2b0835;
$accent-gold: #ffb703;
$accent-pink: #ff4d6d;
$text-main: #ffffff;
$text-muted: rgba(255, 255, 255, 0.75);

.grid-wrapper {
  max-width: 1600px;
  margin: 1.5rem auto 3rem;
  padding: 0 1rem;
}

/* מצב טעינה */
.grid-loading {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: $text-main;

  &__spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.15);
    border-top-color: $accent-gold;
    animation: grid-spin 0.8s linear infinite;
  }

  &__text {
    font-size: 0.95rem;
    color: $text-muted;
  }
}

@keyframes grid-spin {
  to {
    transform: rotate(360deg);
  }
}

/* רשת כרטיסים */
.grid-container {
  width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;

  @media screen and (max-width: 1400px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media screen and (max-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.grid__item {
  display: flex;
  justify-content: center;
}

/* כרטיס */
.profile-card {
  position: relative;
  width: 100%;
  max-width: 120px;
  height: 180px;
  border-radius: 16px;
  background: linear-gradient(145deg, $card-bg1, $card-bg2);
  padding: 0.8rem 0.6rem 0.9rem;
  border: 1px solid rgba(255, 200, 255, 0.4);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.85);
  color: $text-main;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out,
    border-color 0.2s ease-out;
  z-index: 50;

  &-DeleteMode {
    border: 2px solid rgba(239, 68, 68, 0.9); // אדום חזק
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35),
      0 12px 30px rgba(0, 0, 0, 0.85), 0 0 18px rgba(239, 68, 68, 0.7); // זוהר אדום
    transform: translateY(-2px) scale(1.015);
    animation: deleteCardPulse 1.3s infinite ease-in-out;
  }

  .delete-x {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ff6b6b, #b91c1c);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20;
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.7),
      0 0 0 2px rgba(255, 255, 255, 0.8);
    transition: all 0.18s ease;
    animation: deletePulse 1.4s infinite ease-in-out;

    i {
      color: white;
      font-size: 0.85rem;
      font-weight: bold;
    }

    &:hover {
      animation: deleteBounce 0.4s ease-in-out;
      transform: scale(1.35) rotate(8deg);
      box-shadow: 0 12px 30px rgba(220, 38, 38, 0.95), 0 0 0 2px white;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  @keyframes deletePulse {
    0% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
  }

  // כחול חזק לבן (זכר)
  &--male {
    background: linear-gradient(145deg, #1e3a8a, #1e40af);
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 12px 30px rgba(37, 99, 235, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.3);

    &:hover {
      border-color: #3b82f6;
      box-shadow: 0 18px 45px rgba(37, 99, 235, 0.6),
        0 0 0 2px rgba(59, 130, 246, 0.5);
    }
  }

  // כחול חלש לבת (נקבה)
  &--female {
    background: linear-gradient(145deg, #3b82f6, #60a5fa);
    border-color: rgba(147, 197, 253, 0.5);
    box-shadow: 0 12px 30px rgba(96, 165, 250, 0.3),
      0 0 0 1px rgba(147, 197, 253, 0.25);

    &:hover {
      border-color: #93c5fd;
      box-shadow: 0 18px 45px rgba(96, 165, 250, 0.5),
        0 0 0 2px rgba(147, 197, 253, 0.4);
    }
  }
}

.profile-card:hover {
  cursor: pointer;
  transform: translateY(-5px);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.95);
  border-color: $accent-gold;
}

/* תמונה */
.profile-card__image-wrapper {
  margin-top: 0.1rem;
}

.profile-card__image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.9);
  border: 2px solid rgba(255, 200, 255, 0.8);
}

/* גוף הכרטיס */
.profile-card__body {
  margin-top: 0.6rem;
  text-align: center;
  width: 100%;
}

/* כותרת + גיל */
.profile-card__title {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  color: $accent-gold;
  line-height: 1.2;
}

.profile-card__age {
  font-size: 0.75rem;
  font-weight: 500;
  color: $text-main;
}

/* תת כותרת (רמה דתית) */
.profile-card__subtitle {
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: $text-muted;
  line-height: 1.2;
}

/* כפתור "מידע נוסף" */
.profile-card__button {
  margin-top: auto;
  margin-bottom: 0.1rem;
  width: 90%;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, $accent-gold, $accent-pink);
  color: #1a0312;
  font-size: 0.7rem;
  padding: 0.3rem 0.5rem;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.75);
  transform: translateY(8px);
  opacity: 0;
  transition: 0.22s ease-out;
}

.profile-card:hover .profile-card__button {
  transform: translateY(0);
  opacity: 1;
}

/* כשאין נתונים */
.grid-empty {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-empty__text {
  color: $text-muted;
  font-size: 0.95rem;
}

/* ========= רספונסיביות ========= */

/* מובייל – 2 כרטיסיות בשורה */
@media screen and (max-width: 500px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    max-width: 100%;
  }

  .profile-card {
    max-width: 100%;
    height: 160px;
    padding: 0.7rem 0.5rem 0.8rem;
  }

  .profile-card__image {
    width: 50px;
    height: 50px;
  }

  .profile-card__title {
    font-size: 0.8rem;
  }

  .profile-card__age {
    font-size: 0.7rem;
  }

  .profile-card__subtitle {
    font-size: 0.65rem;
  }

  .profile-card__button {
    font-size: 0.65rem;
    padding: 0.25rem 0.4rem;
  }
}

/* מובייל קטן מאוד – 2 כרטיסיות */
@media screen and (max-width: 400px) {
  .grid {
    gap: 0.6rem;
  }

  .profile-card {
    height: 150px;
    padding: 0.6rem 0.4rem 0.7rem;
  }

  .profile-card__image {
    width: 45px;
    height: 45px;
  }

  .profile-card__title {
    font-size: 0.75rem;
  }

  .profile-card__subtitle {
    font-size: 0.6rem;
  }
}

@keyframes deleteCardPulse {
  0% {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35),
      0 12px 30px rgba(0, 0, 0, 0.85), 0 0 12px rgba(239, 68, 68, 0.6);
  }

  50% {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.5), 0 14px 34px rgba(0, 0, 0, 0.9),
      0 0 22px rgba(239, 68, 68, 0.9);
  }

  100% {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35),
      0 12px 30px rgba(0, 0, 0, 0.85), 0 0 12px rgba(239, 68, 68, 0.6);
  }
}
</style>
