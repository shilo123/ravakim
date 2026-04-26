<template>
  <div class="app-root">
    <router-view />
    <GlobalToast />
  </div>
</template>

<script>
import GlobalToast from "@/components/GlobalToast.vue";

export default {
  components: {
    GlobalToast,
  },
  setup() {
    return {};
  },
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial,
    sans-serif;
}

/* זה "האבא" של כל האפליקציה */
.app-root {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, #22bdff33, transparent 40%),
    radial-gradient(circle at 80% 10%, #4554f933, transparent 45%),
    radial-gradient(circle at 50% 90%, #7c5cff33, transparent 40%),
    linear-gradient(135deg, #0f1026, #1a1f4a 40%, #0b0f2e);
  padding-bottom: 4rem;
}

/* סטיילים גלובליים שהיו לך */
input {
  text-align: right !important;
}

select {
  text-align: right;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* לפיירפוקס */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
