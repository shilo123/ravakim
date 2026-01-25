<template>
  <header class="bar-top" dir="rtl">
    <div class="bar-top__inner">
      <!-- שורה עליונה: חיפוש + מגדר + אפשרויות -->
      <div class="bar-top__row bar-top__row--top">
        <!-- חיפוש -->
        <div class="bar-top__search-wrapper">
          <input-Serch v-model="Filters.Name" />
        </div>

        <!-- מגדר + אפשרויות -->
        <div class="bar-top__right-side">
          <!-- מגדר -->
          <div class="bar-top__gender">
            <span class="bar-top__label">מגדר</span>
            <div class="bar-top__gender-tabs">
              <label class="bar-top__tab">
                <input type="radio" value="זכר" v-model="Filters.Gender" />
                <span>גבר</span>
              </label>
              <label class="bar-top__tab">
                <input type="radio" value="נקבה" v-model="Filters.Gender" />
                <span>אישה</span>
              </label>
              <label class="bar-top__tab">
                <input type="radio" value="" v-model="Filters.Gender" />
                <span>הכל</span>
              </label>
            </div>
          </div>

          <!-- אפשרויות -->
          <div class="bar-top__dropdown">
            <Dropdown />
          </div>
        </div>
      </div>

      <!-- שורה תחתונה: רמה דתית + טווח גילאים + כתובת מגורים + סטטוס -->
      <div class="bar-top__row bar-top__row--bottom">
        <!-- כתובת מגורים -->
        <div class="bar-top__field bar-top__field--address">
          <label class="bar-top__label">כתובת מגורים</label>
          <input
            v-model="Filters.Address"
            type="text"
            class="bar-top__input"
            placeholder="חפש לפי כתובת..."
          />
        </div>

        <!-- סטטוס -->
        <div class="bar-top__field bar-top__field--status">
          <label class="bar-top__label">סטטוס</label>
          <input
            v-model="Filters.Status"
            type="text"
            class="bar-top__input"
            placeholder="חפש לפי סטטוס..."
          />
        </div>

        <!-- טווח גילאים -->
        <div class="bar-top__field bar-top__field--ages">
          <label class="bar-top__label">טווח גילאים</label>
          <div class="bar-top__ages">
            <div class="bar-top__age-group">
              <span class="bar-top__age-label">מגיל</span>
              <select
                v-model="Filters.AgeStart"
                class="bar-top__select bar-top__select--age"
              >
                <option
                  v-for="n in 50"
                  :key="`age-start-${n}`"
                  :value="n"
                  :label="n"
                ></option>
              </select>
            </div>

            <div class="bar-top__age-group">
              <span class="bar-top__age-label">עד גיל</span>
              <select
                v-model="Filters.AgeEnd"
                class="bar-top__select bar-top__select--age"
              >
                <option
                  v-for="n in 100"
                  :key="`age-end-${n}`"
                  :value="n"
                  :label="n"
                ></option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, reactive, watch } from "vue";
import "@/views/cssOfRedyElements.scss";
import axios from "axios";
import { URL } from "@/URL/url";
import { useStore } from "vuex";
import Dropdown from "./Elements/DropdownComp.vue";

export default {
  components: { Dropdown },
  setup(props, { emit }) {
    const Store = useStore();

    const Filters = reactive({
      Name: "",
      RamaDatit: "",
      Address: "",
      AgeStart: 1,
      AgeEnd: 100,
      Gender: "",
      Status: "",
    });

    watch(Filters, async () => {
      setTimeout(async () => {
        emit("updateisFinished", false);
        const result = await axios.post(URL + "FilterData", Filters);
        emit("updateisFinished", true);
        emit("UpdateData", result.data);
        console.log("result.data", result.data);
      }, 200);
    });

    const isFinished = computed(() => Store.state.isFinished);

    return { Filters, isFinished };
  },
};
</script>

<style lang="scss" scoped>
$primary: #1152d4;
$bg-dark: #0a1020;
$card-dark: #121a2e;
$border-dark: #1e293b;
$text-main: #ffffff;
$text-muted: #94a3b8;

.bar-top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 16, 32, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.bar-top__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.bar-top__row {
  display: flex;
  align-items: flex-end;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.bar-top__field {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &--ages {
    flex: 1.5;
    min-width: 280px;
  }
}

.bar-top__label {
  font-size: 0.85rem;
  font-weight: 700;
  color: $text-muted;
  margin-right: 0.25rem;
  font-family: 'Assistant', sans-serif;
}

.bar-top__input, .bar-top__select {
  width: 100%;
  height: 2.75rem;
  background: $card-dark;
  border: 1px solid $border-dark;
  border-radius: 0.75rem;
  padding: 0 1rem;
  color: $text-main;
  font-size: 0.95rem;
  font-family: 'Assistant', sans-serif;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:hover {
    border-color: rgba(17, 82, 212, 0.5);
    background: rgba(18, 26, 46, 0.8);
  }

  &:focus {
    outline: none;
    border-color: $primary;
    background: $card-dark;
    box-shadow: 0 0 0 3px rgba(17, 82, 212, 0.2);
  }
}

.bar-top__search-wrapper {
  flex: 1.2;
  min-width: 240px;
}

.bar-top__right-side {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.bar-top__gender {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-top__gender-tabs {
  display: flex;
  background: $card-dark;
  padding: 0.25rem;
  border-radius: 0.75rem;
  border: 1px solid $border-dark;
  height: 2.75rem;
  box-sizing: border-box;
}

.bar-top__tab {
  cursor: pointer;
  flex: 1;
  
  input { display: none; }
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 1.25rem;
    border-radius: 0.6rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: $text-muted;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  input:checked + span {
    background: $primary;
    color: white;
    box-shadow: 0 4px 12px rgba(17, 82, 212, 0.4);
  }

  &:hover span:not(input:checked + span) {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }
}

.bar-top__ages {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: $card-dark;
  padding: 0 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid $border-dark;
  height: 2.75rem;
}

.bar-top__age-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .bar-top__select--age {
    background: transparent;
    border: none;
    box-shadow: none;
    width: auto;
    padding: 0 0.5rem;
    height: 2rem;
    cursor: pointer;
    
    &:hover {
      color: $primary;
    }
  }
}

.bar-top__age-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: $text-muted;
}

@media (max-width: 900px) {
  .bar-top__inner {
    padding: 1rem;
  }
  .bar-top__row {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .bar-top__field {
    min-width: calc(50% - 0.5rem);
    flex: 1 1 calc(50% - 0.5rem);
  }
  
  .bar-top__search-wrapper {
    min-width: 100%;
    order: -2;
  }

  .bar-top__right-side {
    min-width: 100%;
    order: -1;
  }

  .bar-top__gender {
    flex: 1;
  }
  
  .bar-top__gender-tabs {
    width: 100%;
  }

  .bar-top__field--ages {
    min-width: 100%;
  }
}

@media (max-width: 480px) {
  .bar-top__field {
    min-width: 100%;
  }
}
</style>
