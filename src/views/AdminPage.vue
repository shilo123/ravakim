<template>
  <div
    class="ravakim-page"
    :class="{ 'ravakim-page--delete-mode': isDelete }"
    dir="rtl"
  >
    <!-- overlay כהה בזמן מחיקה -->
    <div v-if="isDelete" class="ravakim-page__overlay"></div>

    <main class="ravakim-page__main">
      <div class="ravakim-page__container">
        <!-- כפתור הורדת PDF -->
        <div class="ravakim-page__header">
          <button class="pdf-download-btn" @click="downloadPDF">
            <span class="material-symbols-outlined">description</span>
            <span>לזיווג הגון</span>
          </button>
        </div>

        <BarTop
          @updateisFinished="isFinished = $event"
          @UpdateData="data = $event"
          class="BarTop"
        />

        <!-- Allgrid מקבל מצב מחיקה + פונקציית מחיקה -->
        <Allgrid
          :data="data"
          :isFinished="isFinished"
          :isDeleteMode="isDelete"
          @GetPratim="GetPratim"
          @DelteUser="DelteUser"
        />
      </div>
    </main>

    <DetalisCompVue
      v-if="showDetails && selectedId"
      :id="selectedId"
      @close="showDetails = false"
    />

    <!-- דיאלוג אישור מחיקה -->
    <div
      v-if="showDeleteConfirm"
      class="delete-confirm-overlay"
      @click.self="cancelDelete"
    >
      <div class="delete-confirm-dialog">
        <div class="delete-confirm-header">
          <h3>אישור מחיקה</h3>
          <button class="delete-confirm-close" @click="cancelDelete">✕</button>
        </div>
        <div class="delete-confirm-body">
          <p>האם אתה בטוח שברצונך למחוק את המשתמש הזה?</p>
          <p class="delete-confirm-warning">פעולה זו אינה ניתנת לביטול!</p>
        </div>
        <div class="delete-confirm-actions">
          <button
            class="delete-confirm-btn delete-confirm-btn--cancel"
            @click="cancelDelete"
          >
            ביטול
          </button>
          <button
            class="delete-confirm-btn delete-confirm-btn--confirm"
            @click="confirmDelete"
          >
            מחק
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAxios } from "@vueuse/integrations/useAxios";
// import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { URL } from "@/URL/url";
import { useStore } from "vuex";
import BarTop from "@/components/Admin/BarTopComp.vue";
import Allgrid from "@/components/Admin/GridComp.vue";
import DetalisCompVue from "@/components/Admin/DetalisComp.vue";
import "./cssOfRedyElements.scss";

export default {
  components: { BarTop, Allgrid, DetalisCompVue },
  setup() {
    const Store = useStore();

    // קריאה לשרת + פונקציית רענון
    const { data, isFinished, execute } = useAxios(
      URL + "GetRavakim",
      { method: "GET" },
      { immediate: true } // רץ פעם אחת כשהדף נטען
    );

    const ifPhone = computed(() => window.innerWidth < 400);
    const isDelete = computed(() => Store.state.isDelete);
    const isUpdate = computed(() => Store.state.isUpdate);

    const showDetails = ref(false);
    const selectedId = ref(null);
    const showDeleteConfirm = ref(false);
    const userToDelete = ref(null);

    // עדכון סטטוס טעינה ב-Vuex (אם אתה משתמש בזה במקום אחר)
    watch(isFinished, (val) => {
      Store.commit("updateisFinished", val);
      // console.log("data.value", data.value);
    });

    // אם נכנסים למצב מחיקה – נסגור את דף הפרטים
    watch(isDelete, (val) => {
      if (val) {
        showDetails.value = false;
      }
    });

    watch(isUpdate, (val) => {
      // אם תרצה לעשות משהו כשנכנסים למצב עדכון – תוסיף פה
    });

    onMounted(() => {
      document.body.style.background = "#4da0ff2a";
    });

    const GetPratim = (id) => {
      // אם במצב מחיקה – אל תפתח פירוט
      if (isDelete.value) return;

      selectedId.value = id;
      showDetails.value = true;
      Store.dispatch("GetDetalis", id);
    };

    const DelteUser = (id) => {
      // פתיחת דיאלוג אישור במקום מחיקה ישירה
      userToDelete.value = id;
      showDeleteConfirm.value = true;
    };

    const confirmDelete = async () => {
      if (!userToDelete.value) return;

      try {
        const success = await Store.dispatch("DelteUser", userToDelete.value);

        if (success) {
          await execute();
          Store.commit("UpdateState", { isDelete: false });
          window.$toast && window.$toast("✅ המשתמש נמחק בהצלחה", "success");
        } else {
          console.warn("מחיקה נכשלה בשרת");
          window.$toast && window.$toast("❌ שגיאה במחיקת המשתמש", "error");
        }
      } catch (err) {
        console.error("DeleteUser error:", err);
        window.$toast && window.$toast("❌ שגיאה במחיקת המשתמש", "error");
      } finally {
        // סגירת הדיאלוג
        showDeleteConfirm.value = false;
        userToDelete.value = null;
      }
    };

    const cancelDelete = () => {
      showDeleteConfirm.value = false;
      userToDelete.value = null;
    };

    const downloadPDF = async () => {
      try {
        const response = await fetch(URL + "GeneratePDF", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // בדיקה אם התגובה היא PDF
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/pdf")) {
          const text = await response.text();
          console.error("Server response:", text);
          throw new Error("השרת לא החזיר PDF תקין");
        }

        const blob = await response.blob();

        // בדיקה שהבלוב לא ריק
        if (blob.size === 0) {
          throw new Error("הקובץ ריק");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "לזיווג הגון.pdf";
        document.body.appendChild(a);
        a.click();

        // ניקוי
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        window.$toast && window.$toast("✅ ה-PDF הורד בהצלחה", "success");
      } catch (error) {
        console.error("Error downloading PDF:", error);
        window.$toast &&
          window.$toast(`❌ שגיאה בהורדת PDF: ${error.message}`, "error");
      }
    };

    return {
      data,
      isFinished,
      ifPhone,
      showDetails,
      selectedId,
      GetPratim,
      isDelete,
      DelteUser,
      showDeleteConfirm,
      confirmDelete,
      cancelDelete,
      downloadPDF,
    };
  },
};
</script>

<style scoped lang="scss">
.ravakim-page {
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  background: #0a1020;
  font-family: 'Assistant', sans-serif;
  color: #e5e7eb;
}

.ravakim-page__main {
  width: 100%;
  min-height: 100vh;
  padding-top: 0;
}

.ravakim-page__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
  
  @media (max-width: 600px) {
    padding: 1rem 1rem 2rem;
  }
}

.ravakim-page__header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

/* overlay כהה מאחורי הכרטיסיות */
.ravakim-page__overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 16, 32, 0.75);
  pointer-events: none;
  z-index: 5;
  backdrop-filter: blur(4px);
}

/* דיאלוג אישור מחיקה */
.delete-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.delete-confirm-dialog {
  background: linear-gradient(135deg, #121a2e, #1e293b);
  border-radius: 20px;
  padding: 1.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-family: 'Assistant', sans-serif;
}

.delete-confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    font-family: 'Assistant', sans-serif;
  }
}

.delete-confirm-close {
  background: transparent;
  border: none;
  color: #e5e7eb;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.delete-confirm-body {
  margin-bottom: 1.5rem;

  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #e5e7eb;
  }
}

.delete-confirm-warning {
  color: #fecaca !important;
  font-weight: 600;
  font-size: 0.9rem !important;
}

.delete-confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.delete-confirm-btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Assistant', sans-serif;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &--cancel {
    background: rgba(148, 163, 184, 0.2);
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.05);

    &:hover {
      background: rgba(148, 163, 184, 0.3);
      transform: translateY(-1px);
    }
  }

  &--confirm {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
      filter: brightness(1.1);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

/* כפתור הורדת PDF */
.pdf-download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #1152d4, #0d47a1);
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Assistant', sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(17, 82, 212, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  .material-symbols-outlined {
    font-size: 1.125rem;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 30px -5px rgba(17, 82, 212, 0.7);
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    
    .material-symbols-outlined {
      font-size: 1rem;
    }
  }
}
</style>
