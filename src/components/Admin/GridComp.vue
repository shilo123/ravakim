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

              <div class="profile-card__image-section">
                <div class="profile-card__image-gradient"></div>
                <img
                  :src="Item.picURL || '/Logo.jpg'"
                  :alt="Item.Name || 'תמונה'"
                  class="profile-card__image"
                  @error="(e) => (e.target.src = '/Logo.jpg')"
                />
                <div class="profile-card__image-overlay">
                  <h3 class="profile-card__name">
                    {{ Item.Name || "ללא שם" }}<span v-if="Item.Age">, {{ Item.Age }}</span>
                  </h3>
                </div>
                <button
                  v-show="!isDelete"
                  class="profile-card__favorite-btn"
                  @click.stop
                >
                  <span class="material-symbols-outlined">favorite</span>
                </button>
              </div>

              <div class="profile-card__body">
                <div class="profile-card__info-list">
                  <div v-if="Item.RamaDatit" class="profile-card__info-item">
                    <span class="material-symbols-outlined">workspace_premium</span>
                    <span>{{ Item.RamaDatit }}</span>
                  </div>
                  <div class="profile-card__info-item profile-card__info-item--address">
                    <span class="material-symbols-outlined">location_on</span>
                    <span>{{ Item.Address || "—" }}</span>
                  </div>
                </div>

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
$primary: #1152d4;
$card-dark: #121a2e;
$border-dark: #1e293b;
$text-main: #ffffff;
$text-muted: #94a3b8;
$background-dark: #0a1020;

.grid-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Assistant', sans-serif;
}

/* מצב טעינה */
.grid-loading {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: $text-main;
  padding: 2rem;

  &__spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: $primary;
    animation: grid-spin 0.8s linear infinite;
  }

  &__text {
    font-size: 1rem;
    color: $text-muted;
    font-family: 'Assistant', sans-serif;
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
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.grid__item {
  display: flex;
  margin-bottom: 1.5rem;
}

/* כרטיס */
.profile-card {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 1rem;
  background: $card-dark;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: $text-main;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(17, 82, 212, 0.3);
    box-shadow: 0 0 30px -5px rgba(17, 82, 212, 0.7);
  }

  &-DeleteMode {
    border: 2px solid rgba(239, 68, 68, 0.9);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35),
      0 12px 30px rgba(0, 0, 0, 0.85), 0 0 18px rgba(239, 68, 68, 0.7);
    transform: translateY(-2px) scale(1.015);
    animation: deleteCardPulse 1.3s infinite ease-in-out;
    
    &:hover {
      transform: translateY(-4px) scale(1.015);
    }
  }

  .delete-x {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 25;
    transition: all 0.2s ease;
    border: 2px solid rgba(239, 68, 68, 0.8);

    i {
      color: white;
      font-size: 1rem;
      font-weight: bold;
    }

    &:hover {
      background: rgba(239, 68, 68, 0.9);
      transform: scale(1.1);
      border-color: white;
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
  
  /* גלילת scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: $background-dark;
  }

  ::-webkit-scrollbar-thumb {
    background: $border-dark;
    border-radius: 4px;

    &:hover {
      background: $primary;
    }
  }

  &--male {
    .profile-card__button:hover {
      background: #1152d4;
    }
  }

  &--female {
    .profile-card__button:hover {
      background: #3b82f6;
    }
  }
}

/* סקשן התמונה */
.profile-card__image-section {
  position: relative;
  width: 100%;
  height: 18rem;
  overflow: hidden;
}

.profile-card__image-gradient {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: linear-gradient(to top, $card-dark 0%, transparent 40%, transparent 100%);
  opacity: 0.8;
}

.profile-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.profile-card:hover .profile-card__image {
  transform: scale(1.05);
}

.profile-card__image-overlay {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 20;
  text-align: right;
}

.profile-card__name {
  font-size: 1.5rem;
  font-weight: 700;
  color: $text-main;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-family: 'Assistant', sans-serif;
}

.profile-card__favorite-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease, background 0.2s ease;
  
  .material-symbols-outlined {
    font-size: 1.25rem;
  }

  &:hover {
    background: $primary;
  }
}

.profile-card:hover .profile-card__favorite-btn {
  opacity: 1;
}

/* גוף הכרטיס */
.profile-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem 1.5rem 1.25rem;
}

.profile-card__info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-card__info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: $text-muted;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Assistant', sans-serif;

  .material-symbols-outlined {
    font-size: 1.375rem;
    color: rgba(17, 82, 212, 0.8);
  }

  /* כתובת מגורים - תמיד מוצגת */
  &--address {
    display: flex;
  }
}

/* כפתור "שלח הודעה" */
.profile-card__button {
  margin-top: auto;
  width: 100%;
  border-radius: 0.75rem;
  border: none;
  background: rgba(17, 82, 212, 0.1);
  color: $primary;
  font-size: 0.875rem;
  padding: 0.75rem;
  font-weight: 700;
  font-family: 'Assistant', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $primary;
    color: white;
  }
}

/* כשאין נתונים */
.grid-empty {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.grid-empty__text {
  color: $text-muted;
  font-size: 1rem;
  font-family: 'Assistant', sans-serif;
}

/* ========= רספונסיביות ========= */

@media screen and (max-width: 640px) {
  .grid {
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .profile-card__image-section {
    height: 16rem;
  }

  .profile-card__name {
    font-size: 1.25rem;
  }

  .profile-card__body {
    padding: 1.25rem 1rem 1rem;
    gap: 1rem;
  }

  .profile-card__info-item {
    font-size: 0.9rem;

    .material-symbols-outlined {
      font-size: 1.25rem;
    }
  }

  .profile-card__button {
    font-size: 0.8125rem;
    padding: 0.625rem;
  }
}

@media screen and (max-width: 400px) {
  .grid {
    gap: 1rem;
  }

  .profile-card__image-section {
    height: 14rem;
  }

  .profile-card__name {
    font-size: 1.125rem;
  }

  .profile-card__body {
    padding: 1rem 0.75rem 0.75rem;
    gap: 0.875rem;
  }

  .profile-card__info-item {
    font-size: 0.875rem;

    .material-symbols-outlined {
      font-size: 1.125rem;
    }
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
