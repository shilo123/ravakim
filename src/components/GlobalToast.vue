<template>
  <div v-if="toast.show" class="toast" :class="toast.type">
    {{ toast.text }}
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "GlobalToast",
  setup() {
    const toast = ref({
      show: false,
      text: "",
      type: "success", // 'success' | 'error'
    });

    let timer = null;

    const showToast = (text, type = "success") => {
      toast.value.text = text;
      toast.value.type = type;
      toast.value.show = true;

      clearTimeout(timer);
      timer = setTimeout(() => {
        toast.value.show = false;
      }, 2200);
    };

    onMounted(() => {
      // נהפוך את זה לגלובלי – כל קומפוננטה יכולה לקרוא window.$toast(...)
      window.$toast = showToast;
    });

    onUnmounted(() => {
      if (window.$toast === showToast) {
        delete window.$toast;
      }
      clearTimeout(timer);
    });

    return {
      toast,
    };
  },
};
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  max-width: 90%;
  text-align: center;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
  z-index: 10000;
  color: white;
  animation: toastIn 0.25s ease;
  direction: rtl;
}

.toast.success {
  background: linear-gradient(135deg, #059669, #10b981);
}

.toast.error {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
