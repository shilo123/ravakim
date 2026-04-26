<template>
  <div class="search-root" dir="rtl">
    <div class="searchBox">
      <input
        class="searchInput"
        type="text"
        placeholder="חיפוש לפי שם"
        :value="modelValue"
        @input="emito($event.target.value)"
      />

      <button class="searchButton" type="button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 29 29"
          fill="none"
        >
          <g clip-path="url(#clip0_2_17)">
            <g filter="url(#filter0_d_2_17)">
              <path
                d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                shape-rendering="crispEdges"
              ></path>
            </g>
          </g>
          <defs>
            <filter
              id="filter0_d_2_17"
              x="-0.418549"
              y="3.70435"
              width="29.7139"
              height="29.7139"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              ></feColorMatrix>
              <feOffset dy="4"></feOffset>
              <feGaussianBlur stdDeviation="2"></feGaussianBlur>
              <feComposite in2="hardAlpha" operator="out"></feComposite>
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
              ></feColorMatrix>
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_2_17"
              ></feBlend>
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_2_17"
                result="shape"
              ></feBlend>
            </filter>
            <clipPath id="clip0_2_17">
              <rect
                width="28.0702"
                height="28.0702"
                fill="white"
                transform="translate(0.403503 0.526367)"
              ></rect>
            </clipPath>
          </defs>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["modelValue"],
  setup(props, { emit }) {
    const emito = (text) => {
      emit("update:modelValue", text);
    };

    return { emito };
  },
};
</script>

<style lang="scss" scoped>
$bg-input: rgba(24, 4, 35, 0.96);
$accent-gold: #ffb703;
$accent-pink: #ff4d6d;
$text-main: #ffffff;
$text-muted: rgba(255, 255, 255, 0.7);

.search-root {
  width: 100%;
  display: flex;
  align-items: center;
}

/* קופסת החיפוש */
.searchBox {
  position: relative;
  width: 100%;
  max-width: 260px;
  height: 36px;

  display: flex;
  align-items: center;

  padding-inline: 0.75rem 2.2rem;
  border-radius: 999px;

  background: $bg-input;
  box-shadow: 0 0 0 1px rgba(255, 200, 255, 0.4), 0 6px 16px rgba(0, 0, 0, 0.6);

  transition: box-shadow 0.2s ease, transform 0.1s ease, background 0.2s ease;

  &:focus-within {
    box-shadow: 0 0 0 2px $accent-gold, 0 8px 22px rgba(0, 0, 0, 0.7);
    transform: translateY(-1px);
    background: rgba(31, 6, 46, 0.98);
  }
}

/* אינפוט */
.searchInput {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: $text-main;
  font-size: 0.85rem;
  direction: rtl;

  &::placeholder {
    color: $text-muted;
  }
}

/* כפתור האייקון */
.searchButton {
  position: absolute;
  left: 5px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, $accent-gold, $accent-pink);
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  &:hover {
    filter: brightness(1.05);
    box-shadow: 0 7px 18px rgba(0, 0, 0, 0.8);
    transform: translateY(-1px) scale(1.02);
  }

  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
  }
}
</style>
