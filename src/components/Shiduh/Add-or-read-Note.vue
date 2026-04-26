<template>
  <div class="note-overlay" dir="rtl">
    <div class="note-modal">
      <button class="close-btn" @click="$emit('sgor')">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <!-- יש הערה קיימת -->
      <div v-if="params.Note" class="note-content">
        <h1>הערה</h1>

        <p v-if="!Update" class="note-text">{{ params.Note }}</p>

        <div v-if="Update" class="note-input-wrapper">
          <textarea
            v-model="inputNote"
            class="note-textarea"
            placeholder="עדכן את ההערה..."
          ></textarea>
        </div>

        <div class="note-buttons">
          <button
            v-if="!Update"
            class="primary-btn"
            @click="
              Update = true;
              inputNote = params.Note;
            "
          >
            עדכן
          </button>
          <button
            v-if="Update"
            class="primary-btn"
            @click="AddNote(params._id, inputNote)"
          >
            שמור
          </button>
        </div>
      </div>

      <!-- אין הערה – יצירה -->
      <div v-else class="note-content">
        <h1>הוסף הערה</h1>
        <div class="note-input-wrapper">
          <textarea
            v-model="inputNote"
            class="note-textarea"
            placeholder="הקלד הערה על השידוך..."
          ></textarea>
        </div>

        <div class="note-buttons" v-if="inputNote">
          <button class="primary-btn" @click="AddNote(params._id, inputNote)">
            שמור
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, ref } from "vue";
import axios from "axios";
import { URL } from "@/URL/url";

export default {
  setup() {
    const params = inject("containor_params");
    const inputNote = ref("");
    const Update = ref(false);

    const AddNote = async (id, note) => {
      const paramas = { id, note };
      const { data } = await axios.post(URL + "AddNoteT", paramas);
      if (data) {
        window.location.reload();
      } else {
        window.alert("שמירת הערה נכשלה");
    window.$toast && window.$toast("שמירת הערה נכשלה", "error");

      }
    };

    return { params, inputNote, Update, AddNote };
  },
};
</script>

<style lang="scss" scoped>
.note-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.note-modal {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 18px;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.25s ease-out;
  box-sizing: border-box;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 999px;
  transition: background 0.15s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.note-content {
  text-align: center;
  margin-top: 0.5rem;
}

.note-content h1 {
  margin: 0 0 0.7rem;
  font-size: 1.3rem;
}

.note-text {
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.7rem;
  background: #f7f7f9;
  border-radius: 12px;
  max-height: 45vh;
  overflow-y: auto;
}

.note-input-wrapper {
  margin-top: 0.5rem;
}

.note-textarea {
  width: 100%;
  min-height: 150px;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 0.7rem;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border 0.15s, box-shadow 0.15s;
}

.note-textarea:focus {
  border-color: #ff8e8e;
  box-shadow: 0 0 0 2px rgba(255, 142, 142, 0.25);
}

.note-buttons {
  margin-top: 0.8rem;
  display: flex;
  justify-content: center;
}

.primary-btn {
  border-radius: 999px;
  border: none;
  padding: 0.45rem 1.2rem;
  background: linear-gradient(135deg, #ff6b6b, #f99a4d);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.35);
  transition: transform 0.12s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 107, 107, 0.45);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
