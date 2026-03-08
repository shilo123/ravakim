<template>
  <div class="details-overlay" dir="rtl" @click.self="close">
    <div class="details-card">
      <!-- כפתורים עליונים -->
      <button class="close-btn" @click="close">✕</button>
      <button class="export-btn" @click="exportDetails">⬇️ ייצוא פרטים</button>

      <!-- מצבים -->
      <div v-if="loading" class="state-msg">טוען פרטים...</div>
      <div v-else-if="error" class="state-msg error">שגיאה בטעינת הנתונים</div>

      <!-- תוכן -->
      <div v-else-if="user" class="content">
        <!-- חלק עליון -->
        <div class="top">
          <div class="avatar-section-wrapper">
            <div class="avatar-wrapper" @click="openImageModal">
              <img
                :src="user.picURL || defaultImage"
                class="avatar"
                @error="handleImageError"
              />
            </div>
            <label class="avatar-upload-label">
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                hidden
              />
              <i class="fa-solid fa-camera"></i> שנה תמונה
            </label>
          </div>
          <div class="top-text">
            <h2>{{ user.Name }}</h2>
            <p class="sub">{{ user.age }} · {{ user.Gender }}<span v-if="user.Height"> · {{ user.Height }} ס"מ</span></p>
            <p class="job">{{ user.IsuckOrMosadLimudim }}</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- פרטים -->
        <div class="grid">
          <!-- גיל ורמה דתית באותה שורה -->
          <div class="grid-row-2">
            <!-- גיל -->
            <div class="block" v-if="user.Age || user.age">
              <h3>גיל</h3>

              <!-- מצב תצוגה -->
              <p class="row" v-if="editField !== 'Age'">
                <span>{{ user.Age ?? user.age }}</span>
                <i
                  class="fa-solid fa-pen edit-icon"
                  @click="startEdit('Age')"
                ></i>
              </p>

              <!-- מצב עריכה -->
              <div class="edit-row" v-else>
                <input
                  v-model="editDraft"
                  class="edit-input"
                  type="number"
                  min="0"
                />
                <button class="edit-save" @click="confirmEdit('Age')">
                  עדכון
                </button>
                <button class="edit-cancel" @click="cancelEdit">בטל</button>
              </div>
            </div>

            <!-- רמה דתית -->
            <div class="block" v-if="user.RamaDatit">
              <h3>רמה דתית</h3>

              <!-- מצב תצוגה -->
              <p class="row" v-if="editField !== 'RamaDatit'">
                <span>{{ user.RamaDatit }}</span>
                <i
                  class="fa-solid fa-pen edit-icon"
                  @click="startEdit('RamaDatit')"
                ></i>
              </p>

              <!-- מצב עריכה -->
              <div class="edit-row" v-else>
                <input v-model="editDraft" class="edit-input" type="text" />
                <button class="edit-save" @click="confirmEdit('RamaDatit')">
                  עדכון
                </button>
                <button class="edit-cancel" @click="cancelEdit">בטל</button>
              </div>
            </div>

            <!-- סטטוס -->
            <div class="block" v-if="user.Status">
              <h3>סטטוס</h3>

              <!-- מצב תצוגה -->
              <p class="row" v-if="editField !== 'Status'">
                <span>{{ user.Status }}</span>
                <i
                  class="fa-solid fa-pen edit-icon"
                  @click="startEdit('Status')"
                ></i>
              </p>

              <!-- מצב עריכה -->
              <div class="edit-row" v-else>
                <input v-model="editDraft" class="edit-input" type="text" />
                <button class="edit-save" @click="confirmEdit('Status')">
                  עדכון
                </button>
                <button class="edit-cancel" @click="cancelEdit">בטל</button>
              </div>
            </div>

            <!-- גובה -->
            <div class="block">
              <h3>גובה (ס"מ)</h3>

              <!-- מצב תצוגה -->
              <p class="row" v-if="editField !== 'Height'">
                <span>{{ user.Height || "—" }}</span>
                <i
                  class="fa-solid fa-pen edit-icon"
                  @click="startEdit('Height')"
                ></i>
              </p>

              <!-- מצב עריכה -->
              <div class="edit-row" v-else>
                <input
                  v-model="editDraft"
                  class="edit-input"
                  type="number"
                  min="100"
                  max="250"
                  placeholder="גובה בס״מ"
                />
                <button class="edit-save" @click="confirmEdit('Height')">
                  עדכון
                </button>
                <button class="edit-cancel" @click="cancelEdit">בטל</button>
              </div>
            </div>
          </div>

          <!-- אופי -->
          <div class="block" v-if="user.Ofi">
            <h3>אופי</h3>

            <p class="row" v-if="editField !== 'Ofi'">
              <span>{{ user.Ofi }}</span>
              <i
                class="fa-solid fa-pen edit-icon"
                @click="startEdit('Ofi')"
              ></i>
            </p>

            <div class="edit-row" v-else>
              <input v-model="editDraft" class="edit-input" type="text" />
              <button class="edit-save" @click="confirmEdit('Ofi')">
                עדכון
              </button>
              <button class="edit-cancel" @click="cancelEdit">בטל</button>
            </div>
          </div>

          <!-- תחביבים -->
          <div class="block" v-if="user.Hobits">
            <h3>תחביבים</h3>

            <p class="row" v-if="editField !== 'Hobits'">
              <span>{{ user.Hobits }}</span>
              <i
                class="fa-solid fa-pen edit-icon"
                @click="startEdit('Hobits')"
              ></i>
            </p>

            <div class="edit-row" v-else>
              <input v-model="editDraft" class="edit-input" type="text" />
              <button class="edit-save" @click="confirmEdit('Hobits')">
                עדכון
              </button>
              <button class="edit-cancel" @click="cancelEdit">בטל</button>
            </div>
          </div>

          <!-- מה מחפש -->
          <div class="block" v-if="user.MaMehapes">
            <h3>מה מחפש</h3>

            <p class="row" v-if="editField !== 'MaMehapes'">
              <span>{{ user.MaMehapes }}</span>
              <i
                class="fa-solid fa-pen edit-icon"
                @click="startEdit('MaMehapes')"
              ></i>
            </p>

            <div class="edit-row" v-else>
              <input v-model="editDraft" class="edit-input" type="text" />
              <button class="edit-save" @click="confirmEdit('MaMehapes')">
                עדכון
              </button>
              <button class="edit-cancel" @click="cancelEdit">בטל</button>
            </div>
          </div>

          <!-- משפחה -->
          <div class="block" v-if="user.KavimClalim">
            <h3>משפחה</h3>

            <p class="row" v-if="editField !== 'KavimClalim'">
              <span>{{ user.KavimClalim }}</span>
              <i
                class="fa-solid fa-pen edit-icon"
                @click="startEdit('KavimClalim')"
              ></i>
            </p>

            <div class="edit-row" v-else>
              <input v-model="editDraft" class="edit-input" type="text" />
              <button class="edit-save" @click="confirmEdit('KavimClalim')">
                עדכון
              </button>
              <button class="edit-cancel" @click="cancelEdit">בטל</button>
            </div>
          </div>

          <!-- כתובת מגורים וטלפון באותה שורה -->
          <div class="grid-row-2">
            <!-- כתובת מגורים -->
            <div class="block">
              <h3>כתובת מגורים</h3>

              <p class="row" v-if="editField !== 'Address'">
                <span>{{ user.Address || "—" }}</span>
                <i
                  class="fa-solid fa-pen edit-icon"
                  @click="startEdit('Address')"
                ></i>
              </p>

              <div class="edit-row" v-else>
                <input
                  v-model="editDraft"
                  class="edit-input"
                  type="text"
                  placeholder="הקלד כתובת מגורים"
                />
                <button class="edit-save" @click="confirmEdit('Address')">
                  עדכון
                </button>
                <button class="edit-cancel" @click="cancelEdit">בטל</button>
              </div>
            </div>

            <!-- טלפון -->
            <div class="block">
              <h3>טלפון</h3>

              <p class="row" v-if="editField !== 'phone'">
                <span>{{ user.phone || "—" }}</span>
                <i
                  class="fa-solid fa-pen edit-icon"
                  @click="startEdit('phone')"
                ></i>
              </p>

              <div class="edit-row" v-else>
                <input
                  v-model="editDraft"
                  class="edit-input"
                  type="tel"
                  placeholder="הקלד מספר טלפון"
                />
                <button class="edit-save" @click="confirmEdit('phone')">
                  עדכון
                </button>
                <button class="edit-cancel" @click="cancelEdit">בטל</button>
              </div>
            </div>
          </div>

          <!-- סרטון -->
          <div class="block" v-if="user.videoURL">
            <h3>סרטון</h3>
            <button class="video-view-btn" @click="openVideoModal">
              🎥 צפייה בסרטון
            </button>
          </div>

          <!-- הערה -->
          <div class="block">
            <h3>הערה</h3>
            <textarea v-model="noteDraft" placeholder="כתוב הערה..."></textarea>
            <button class="save-btn" @click="saveNote">שמור הערה</button>
          </div>
        </div>
      </div>

      <div v-else class="state-msg">אין נתונים</div>
    </div>

    <!-- פופאפ תמונה מלא מסך -->
    <div
      v-if="showImageModal && user?.picURL"
      class="image-modal-overlay"
      @click.self="closeImageModal"
    >
      <div class="image-modal-content">
        <button class="image-modal-close" @click="closeImageModal">✕</button>
        <img :src="user.picURL" class="image-modal-img" alt="תמונה" />
      </div>
    </div>

    <!-- פופאפ סרטון מלא מסך -->
    <div
      v-if="showVideoModal && user?.videoURL"
      class="video-modal-overlay"
      @click.self="closeVideoModal"
    >
      <button class="video-modal-close" @click="closeVideoModal">✕</button>
      <div class="video-modal-content">
        <video
          :src="user.videoURL"
          class="video-modal-video"
          controls
          autoplay
        ></video>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import axios from "axios";
import { URL } from "@/URL/url";

export default {
  name: "DetalisComp",
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(false);
    const noteDraft = ref("");
    const showImageModal = ref(false);
    const showVideoModal = ref(false);
    const defaultImage = "/Logo.jpg";
    const imageError = ref(false);

    // שדה שנמצא כרגע בעריכה + הערך הזמני שלו
    const editField = ref(null); // למשל "RamaDatit" / "Age" וכו'
    const editDraft = ref("");

    const fetchDetails = async () => {
      if (!props.id) return;
      loading.value = true;
      error.value = false;

      try {
        const { data } = await axios.get(`${URL}GetDetalis/${props.id}`);
        user.value = data;
        noteDraft.value = data?.Note || "";
      } catch (e) {
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const EditUser = async (payload) => {
      const { id, field, value } = payload;
      await axios.put(`${URL}EditUser`, { id, field, value });
    };

    const startEdit = (fieldKey) => {
      if (!user.value) return;
      editField.value = fieldKey;
      editDraft.value = user.value[fieldKey] ?? "";
    };

    const cancelEdit = () => {
      editField.value = null;
      editDraft.value = "";
    };

    const confirmEdit = (fieldKey) => {
      if (!user.value) return;

      const payload = {
        id: user.value._id,
        field: fieldKey,
        value: editDraft.value,
      };

      EditUser(payload);

      // עדכון מקומי ב-UI (אופטימי)
      user.value[fieldKey] = editDraft.value;

      // יציאה ממצב עריכה
      editField.value = null;
      editDraft.value = "";
    };

    watch(
      () => props.id,
      () => {
        fetchDetails();
      },
      { immediate: true }
    );

    const saveNote = async () => {
      try {
        await axios.put(`${URL}UpdateNote/${props.id}`, {
          Note: noteDraft.value,
        });
        user.value.Note = noteDraft.value;
        window.$toast && window.$toast("✅ הערה נשמרה", "success");
      } catch (e) {
        window.$toast && window.$toast("❌ שגיאה בשמירת הערה", "error");
      }
    };

    const LOGUSER = (userObj) => {
      console.log({ ...userObj });
    };

    const exportDetails = async () => {
      if (!user.value) return;

      let imageUrl = user.value.picURL || "";
      imageUrl = encodeURI(imageUrl);
      const content = `
${imageUrl ? "🖼️ תמונה:\n" + imageUrl + "\n\n" : ""}🧑‍💼 *כרטיס מועמד*

👤 *שם:* ${user.value.Name || "—"}
🎂 *גיל:* ${user.value.Age || "—"}
🚻 *מגדר:* ${user.value.Gender || "—"}
📞 *טלפון:* ${user.value.phone || "—"}
💼 *עיסוק:* ${user.value.IsuckOrMosadLimudim || "—"}
📍 *כתובת מגורים:* ${user.value.Address || "—"}
📏 *גובה:* ${user.value.Height ? user.value.Height + ' ס"מ' : "—"}
🕍 *רמה דתית:* ${user.value.RamaDatit || "—"}
🧠 *אופי:* ${user.value.Ofi || "—"}
🎯 *תחביבים:* ${user.value.Hobits || "—"}
❤️ *מה מחפש:* ${user.value.MaMehapes || "—"}
👨‍👩‍👧‍👦 *משפחה:* ${user.value.KavimClalim || "—"}

📌 נשלח דרך https://server-ravakim-10c1effbda77.herokuapp.com/ 
`.trim();

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(content);
          window.$toast && window.$toast("✅ הפרטים הועתקו לווצאפ", "success");
        } else {
          const temp = document.createElement("textarea");
          temp.value = content;
          temp.style.position = "fixed";
          temp.style.opacity = "0";
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
          window.$toast && window.$toast("✅ הפרטים הועתקו לווצאפ", "success");
        }
      } catch (e) {
        window.$toast && window.$toast("❌ לא הצלחתי להעתיק לווצאפ", "error");
      }
    };

    const close = () => emit("close");

    const openImageModal = () => {
      if (user.value?.picURL) {
        showImageModal.value = true;
      }
    };

    const closeImageModal = () => {
      showImageModal.value = false;
    };

    const openVideoModal = () => {
      if (user.value?.videoURL) {
        showVideoModal.value = true;
      }
    };

    const closeVideoModal = () => {
      showVideoModal.value = false;
    };

    const handleImageError = (event) => {
      imageError.value = true;
      if (event.target.src !== defaultImage) {
        event.target.src = defaultImage;
      }
    };

    const handleImageUpload = async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      try {
        loading.value = true;
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post("/postFilee", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // עדכון התמונה במשתמש
        await axios.put(`${URL}EditUser`, {
          id: user.value._id,
          field: "picURL",
          value: data,
        });

        user.value.picURL = data;
        imageError.value = false;
        window.$toast && window.$toast("✅ התמונה עודכנה בהצלחה", "success");
      } catch (e) {
        window.$toast && window.$toast("❌ שגיאה בהעלאת התמונה", "error");
      } finally {
        loading.value = false;
      }
    };

    const initials = computed(() => {
      if (!user.value?.Name) return "?";
      const parts = user.value.Name.split(" ");
      return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
    });

    return {
      EditUser,
      user,
      loading,
      error,
      noteDraft,
      saveNote,
      exportDetails,
      close,
      LOGUSER,
      initials,
      editField,
      editDraft,
      startEdit,
      cancelEdit,
      confirmEdit,
      showImageModal,
      openImageModal,
      closeImageModal,
      showVideoModal,
      openVideoModal,
      closeVideoModal,
      defaultImage,
      handleImageError,
      handleImageUpload,
    };
  },
};
</script>

<style scoped lang="scss">
.details-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1.5rem;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.details-card {
  width: min(720px, 100%);
  max-height: 90vh;
  background: #0f172a;
  border-radius: 1.5rem;
  padding: 2.5rem;
  color: #f8fafc;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  direction: rtl;
  font-family: 'Assistant', sans-serif;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1rem;
    max-height: 95vh;
  }
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: rotate(90deg);
  }
}

.export-btn {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  background: linear-gradient(135deg, #1152d4, #0d47a1);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(17, 82, 212, 0.3);
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(17, 82, 212, 0.5);
    filter: brightness(1.1);
  }

  @media (max-width: 640px) {
    position: static;
    width: 100%;
    text-align: center;
    margin-bottom: 0.75rem;
  }
}

.top {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }
}

.avatar-section-wrapper {
  flex-shrink: 0;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 2rem;
  overflow: hidden;
  border: 3px solid rgba(17, 82, 212, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #60a5fa;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #93c5fd;
  }
}

.top-text {
  h2 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: white;
  }
  .sub {
    font-size: 1.125rem;
    color: #94a3b8;
    font-weight: 500;
  }
  .job {
    font-size: 1rem;
    color: #60a5fa;
    margin-top: 0.25rem;
  }
}

.divider {
  height: 1px;
  background: linear-gradient(to left, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 2rem 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.grid-row-2 {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-column: span 1;
  }
}

.block {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(17, 82, 212, 0.3);
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #60a5fa;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1rem;
    font-weight: 500;
    color: #f1f5f9;
    margin: 0;
  }
}

textarea {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #1152d4;
  }
}

.save-btn {
  width: 100%;
  margin-top: 1rem;
  background: rgba(17, 82, 212, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(17, 82, 212, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1152d4;
    color: white;
  }
}

.video-view-btn {
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }
}

/* עריכה */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.edit-icon {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    color: #60a5fa;
    background: rgba(255, 255, 255, 0.05);
  }
}

.edit-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.edit-input {
  flex: 1;
  background: rgba(2, 6, 23, 0.8);
  border: 1px solid #1e293b;
  border-radius: 0.5rem;
  padding: 0.4rem 0.75rem;
  color: white;
  font-family: inherit;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #1152d4;
  }
}

.edit-save, .edit-cancel {
  border: none;
  border-radius: 0.5rem;
  padding: 0 0.75rem;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}

.edit-save { background: #10b981; color: white; }
.edit-cancel { background: #ef4444; color: white; }

/* פופאפים */
.image-modal-overlay, .video-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.95);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10005;
  padding: 2rem;
}

.image-modal-img, .video-modal-video {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}

.image-modal-close, .video-modal-close {
  position: fixed;
  top: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}
</style>