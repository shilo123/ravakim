<template>
  <header class="filterbar" dir="rtl">
    <div class="filterbar__inner">
      <!-- שורה ראשית: חיפוש + מגדר + פעולות -->
      <div class="filterbar__main">
        <div class="filterbar__search">
          <svg
            class="filterbar__search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            v-model="Filters.Name"
            type="text"
            class="filterbar__search-input"
            placeholder="חיפוש לפי שם..."
          />
          <button
            v-if="Filters.Name"
            class="filterbar__search-clear"
            @click="Filters.Name = ''"
            aria-label="נקה חיפוש"
          >
            ✕
          </button>
        </div>

        <div class="filterbar__gender">
          <label
            v-for="opt in genderOptions"
            :key="opt.value"
            class="filterbar__gender-tab"
          >
            <input type="radio" :value="opt.value" v-model="Filters.Gender" />
            <span>{{ opt.label }}</span>
          </label>
        </div>

        <button
          class="filterbar__toggle"
          :class="{ 'is-open': showAdvanced }"
          @click="showAdvanced = !showAdvanced"
        >
          <span>סינון מתקדם</span>
          <span v-if="activeCount" class="filterbar__badge">{{
            activeCount
          }}</span>
          <svg
            class="filterbar__chevron"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div class="filterbar__actions">
          <Dropdown />
        </div>
      </div>

      <!-- סינון מתקדם -->
      <div class="filterbar__advanced" :class="{ 'is-open': showAdvanced }">
        <div class="ffield">
          <label class="ffield__label">רמה דתית</label>
          <input
            v-model="Filters.RamaDatit"
            type="text"
            class="ffield__input"
            placeholder="דתי / מסורתי / חרדי..."
          />
        </div>

        <div class="ffield">
          <label class="ffield__label">כתובת מגורים</label>
          <input
            v-model="Filters.Address"
            type="text"
            class="ffield__input"
            placeholder="עיר / יישוב..."
          />
        </div>

        <div class="ffield">
          <label class="ffield__label">סטטוס</label>
          <input
            v-model="Filters.Status"
            type="text"
            class="ffield__input"
            placeholder="רווק/ה, גרוש/ה..."
          />
        </div>

        <div class="ffield ffield--ages">
          <label class="ffield__label">טווח גילאים</label>
          <div class="ages">
            <select v-model="Filters.AgeStart" class="ages__select">
              <option v-for="n in 100" :key="'s' + n" :value="n">
                {{ n }}
              </option>
            </select>
            <span class="ages__sep">עד</span>
            <select v-model="Filters.AgeEnd" class="ages__select">
              <option v-for="n in 100" :key="'e' + n" :value="n">
                {{ n }}
              </option>
            </select>
            <span class="ages__hint">שנים</span>
          </div>
        </div>
      </div>

      <!-- צ'יפים של סינון פעיל -->
      <div v-if="activeChips.length" class="filterbar__chips">
        <button
          v-for="chip in activeChips"
          :key="chip.key"
          class="chip"
          @click="clearChip(chip.key)"
        >
          <span>{{ chip.label }}</span>
          <span class="chip__x">✕</span>
        </button>
        <button class="chip chip--clear" @click="clearAll">נקה הכל</button>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, reactive, ref, watch } from "vue";
import "@/views/cssOfRedyElements.scss";
import axios from "axios";
import { URL } from "@/URL/url";
import Dropdown from "./Elements/DropdownComp.vue";

const DEFAULTS = {
  Name: "",
  RamaDatit: "",
  Address: "",
  AgeStart: 1,
  AgeEnd: 100,
  Gender: "",
  Status: "",
};

export default {
  components: { Dropdown },
  setup(props, { emit }) {
    const Filters = reactive({ ...DEFAULTS });
    const showAdvanced = ref(false);

    const genderOptions = [
      { value: "", label: "הכל" },
      { value: "זכר", label: "גברים" },
      { value: "נקבה", label: "נשים" },
    ];

    let debounceTimer = null;
    watch(Filters, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        emit("updateisFinished", false);
        const result = await axios.post(URL + "FilterData", Filters);
        emit("updateisFinished", true);
        emit("UpdateData", result.data);
      }, 250);
    });

    const activeChips = computed(() => {
      const chips = [];
      if (Filters.Name) chips.push({ key: "Name", label: `שם: ${Filters.Name}` });
      if (Filters.Gender)
        chips.push({
          key: "Gender",
          label: Filters.Gender === "זכר" ? "גברים" : "נשים",
        });
      if (Filters.RamaDatit)
        chips.push({ key: "RamaDatit", label: `רמה דתית: ${Filters.RamaDatit}` });
      if (Filters.Address)
        chips.push({ key: "Address", label: `כתובת: ${Filters.Address}` });
      if (Filters.Status)
        chips.push({ key: "Status", label: `סטטוס: ${Filters.Status}` });
      if (Filters.AgeStart !== DEFAULTS.AgeStart || Filters.AgeEnd !== DEFAULTS.AgeEnd)
        chips.push({
          key: "Ages",
          label: `גיל ${Filters.AgeStart}–${Filters.AgeEnd}`,
        });
      return chips;
    });

    const activeCount = computed(() => activeChips.value.length);

    const clearChip = (key) => {
      if (key === "Ages") {
        Filters.AgeStart = DEFAULTS.AgeStart;
        Filters.AgeEnd = DEFAULTS.AgeEnd;
      } else {
        Filters[key] = "";
      }
    };

    const clearAll = () => {
      Object.assign(Filters, { ...DEFAULTS });
    };

    return {
      Filters,
      showAdvanced,
      genderOptions,
      activeChips,
      activeCount,
      clearChip,
      clearAll,
    };
  },
};
</script>

<style lang="scss" scoped>
$primary: #1152d4;
$primary-soft: rgba(17, 82, 212, 0.16);
$bg-panel: rgba(15, 22, 40, 0.92);
$card: #141d33;
$border: rgba(148, 163, 184, 0.16);
$text-main: #f1f5f9;
$text-muted: #8fa0bb;

.filterbar {
  position: sticky;
  top: 0.75rem;
  z-index: 100;
  margin-bottom: 2rem;
  font-family: "Assistant", sans-serif;
}

.filterbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  background: $bg-panel;
  backdrop-filter: blur(14px);
  border: 1px solid $border;
  border-radius: 18px;
  padding: 0.9rem 1rem;
  box-shadow: 0 18px 44px -18px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

// ---- שורה ראשית ----
.filterbar__main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filterbar__search {
  position: relative;
  flex: 1 1 240px;
  min-width: 200px;
  display: flex;
  align-items: center;
}

.filterbar__search-icon {
  position: absolute;
  right: 0.85rem;
  width: 16px;
  height: 16px;
  color: $text-muted;
  pointer-events: none;
}

.filterbar__search-input {
  width: 100%;
  height: 2.75rem;
  box-sizing: border-box;
  background: $card;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 0 2.4rem 0 2.2rem;
  color: $text-main;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px $primary-soft;
  }
}

.filterbar__search-clear {
  position: absolute;
  left: 0.6rem;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.15);
  color: $text-muted;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(148, 163, 184, 0.3);
    color: $text-main;
  }
}

// מגדר
.filterbar__gender {
  display: flex;
  background: $card;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 0.25rem;
  height: 2.75rem;
  box-sizing: border-box;
}

.filterbar__gender-tab {
  cursor: pointer;

  input {
    display: none;
  }

  span {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 1rem;
    border-radius: 9px;
    font-size: 0.85rem;
    font-weight: 700;
    color: $text-muted;
    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  input:checked + span {
    background: $primary;
    color: #fff;
    box-shadow: 0 6px 16px -6px rgba(17, 82, 212, 0.8);
  }

  &:hover input:not(:checked) + span {
    color: $text-main;
  }
}

// כפתור סינון מתקדם
.filterbar__toggle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.75rem;
  padding: 0 1rem;
  border-radius: 12px;
  border: 1px solid $border;
  background: $card;
  color: $text-main;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: rgba(17, 82, 212, 0.6);
  }

  &.is-open {
    border-color: $primary;
    background: $primary-soft;
  }
}

.filterbar__badge {
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: $primary;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filterbar__chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;

  .is-open & {
    transform: rotate(180deg);
  }
}

.filterbar__actions {
  margin-right: auto;
}

// ---- סינון מתקדם ----
.filterbar__advanced {
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid $border;

  &.is-open {
    display: grid;
  }

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.ffield {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ffield__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: $text-muted;
  letter-spacing: 0.02em;
}

.ffield__input {
  height: 2.6rem;
  box-sizing: border-box;
  background: $card;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 0 0.85rem;
  color: $text-main;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: rgba(143, 160, 187, 0.55);
  }

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px $primary-soft;
  }
}

.ages {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: $card;
  border: 1px solid $border;
  border-radius: 10px;
  height: 2.6rem;
  box-sizing: border-box;
  padding: 0 0.75rem;
}

.ages__select {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: $text-main;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;

  &:focus {
    outline: none;
  }

  option {
    background: $card;
    color: $text-main;
  }
}

.ages__sep,
.ages__hint {
  font-size: 0.78rem;
  color: $text-muted;
  white-space: nowrap;
}

// ---- צ'יפים ----
.filterbar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(17, 82, 212, 0.5);
  background: $primary-soft;
  color: $text-main;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: rgba(17, 82, 212, 0.3);
  }

  &--clear {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.12);

    &:hover {
      background: rgba(239, 68, 68, 0.25);
    }
  }
}

.chip__x {
  font-size: 0.6rem;
  opacity: 0.7;
}

// ---- מובייל ----
@media (max-width: 768px) {
  .filterbar {
    top: 0.5rem;
  }

  .filterbar__inner {
    padding: 0.7rem 0.75rem;
  }

  .filterbar__search {
    flex: 1 1 100%;
    order: -1;
  }

  .filterbar__gender {
    flex: 1;

    .filterbar__gender-tab {
      flex: 1;

      span {
        justify-content: center;
        padding: 0;
      }
    }
  }

  .filterbar__toggle {
    padding: 0 0.75rem;
  }

  .filterbar__actions {
    margin-right: 0;
  }
}
</style>
