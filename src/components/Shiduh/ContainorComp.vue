<template>
  <div class="shidduch-container" v-if="ifDOM" dir="rtl">
    <!-- צד שמאל: מאגר גברים ונשים -->
    <section class="people-panel">
      <div class="panel-header">
        <h2>מאגר מועמדים</h2>
        <p>גרור גבר ואישה ליצירת שידוך חדש או לשידוך קיים</p>
      </div>

      <div class="people-columns">
        <!-- גברים -->
        <div class="people-list men">
          <div class="people-list-header">
            <span class="tag tag-men">גברים</span>
          </div>

          <draggable
            v-model="men"
            :group="{ name: 'people', pull: 'clone' }"
            @end="Evenetdraggable"
            class="people-draggable"
          >
            <div
              class="person-item"
              v-for="(ish, i) in men"
              :key="'m-' + (ish._id || i)"
            >
              <div class="avatar">
                <img
                  v-if="ish.picURL"
                  @error="error[`itemMan-${i}`] = true"
                  :src="!error[`itemMan-${i}`] ? ish.picURL : imageError"
                  alt="תמונה"
                />
                <div v-else class="avatar-placeholder">
                  {{ ish.Name?.charAt(0) || "מ" }}
                </div>
              </div>
              <div class="person-info">
                <div class="name">{{ ish.Name }}</div>
                <div class="meta">גיל {{ ish.Age }}</div>
              </div>
            </div>
          </draggable>
        </div>

        <!-- נשים -->
        <div class="people-list women">
          <div class="people-list-header">
            <span class="tag tag-women">נשים</span>
          </div>

          <draggable
            v-model="women"
            :group="{ name: 'people', pull: 'clone' }"
            @end="Evenetdraggable"
            class="people-draggable"
          >
            <div
              class="person-item"
              v-for="(ish, i) in women"
              :key="'w-' + (ish._id || i)"
            >
              <div class="avatar">
                <img
                  v-if="ish.picURL"
                  @error="error[`itemWoman-${i}`] = true"
                  :src="!error[`itemWoman-${i}`] ? ish.picURL : imageError"
                  alt="תמונה"
                />
                <div v-else class="avatar-placeholder">
                  {{ ish.Name?.charAt(0) || "נ" }}
                </div>
              </div>
              <div class="person-info">
                <div class="name">{{ ish.Name }}</div>
                <div class="meta">גיל {{ ish.Age }}</div>
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </section>

    <!-- צד ימין: יצירת שידוך + שידוכים קיימים -->
    <section :class="['matches-panel', { 'matches-panel--compact': newShi }]">
      <div class="matches-header">
        <div>
          <h2>פוטנציאל לשידוך</h2>
          <p v-if="!newShi">בחר שידוך קיים או צור חדש בעזרת גרירה מהמאגר</p>
          <p v-else>גרור גבר ואישה לאזור למטה ואז שמור שידוך</p>
        </div>
        <button class="primary-btn" @click="AddNewShiduh">
          {{ !newShi ? "צור שידוך חדש" : "סגור יצירת שידוך" }}
        </button>
      </div>

      <!-- יצירת שידוך חדש -->
      <div v-if="newShi" class="new-match-card">
        <div class="new-match-title">שידוך חדש</div>
        <div class="new-match-description">
          גרור גבר מצד שמאל ואישה מצד ימין לאזור זה
        </div>

        <draggable
          v-model="newSHiduh"
          group="people"
          class="new-match-dropzone"
        >
          <div
            v-for="(sod, i) in newSHiduh"
            :key="'new-' + (sod._id || i)"
            class="new-match-person"
            :class="sod.Gender === 'זכר' ? 'new-man' : 'new-woman'"
          >
            <div class="avatar small">
              <img
                v-if="sod.picURL"
                @error="error[`itemNewShid-${i}`] = true"
                :src="!error[`itemNewShid-${i}`] ? sod.picURL : imageError"
                alt="תמונה"
              />
              <div v-else class="avatar-placeholder">
                {{ sod.Name?.charAt(0) || "?" }}
              </div>
            </div>
            <div class="person-info">
              <div class="name">{{ sod.Name }}</div>
              <div class="meta">גיל {{ sod.Age }}</div>
            </div>
          </div>
        </draggable>

        <div class="new-match-footer">
          <div class="pair-status" :class="{ 'pair-status--ready': ifSubmit }">
            <i class="fa-duotone fa-heart"></i>
            <span>
              {{
                ifSubmit ? "זוג מוכן לשמירה" : "נדרש לבחור גבר אחד ואישה אחת"
              }}
            </span>
          </div>
          <button
            class="primary-btn full-width"
            :disabled="!ifSubmit"
            @click="InsertNewSHid"
          >
            שמור שידוך
          </button>
        </div>
      </div>

      <!-- רשימת שידוכים קיימים -->
      <div class="matches-list">
        <article
          class="match-card"
          v-for="(itmem, i) in resonse"
          :key="itmem._id || i"
        >
          <div class="match-card-header">
            <div class="match-label">
              <span class="chip">שידוך #{{ i + 1 }}</span>
              <span v-if="itmem.Note" class="chip chip-note" title="קיימת הערה">
                הערה קיימת
              </span>
            </div>
            <div class="match-actions">
              <button
                class="ghost-btn"
                @click="AddNoteee(itmem)"
                :class="{ 'ghost-btn--highlight': itmem.Note }"
              >
                <i class="fa-duotone fa-notes-medical" v-if="!itmem.Note"></i>
                <i class="fa-duotone fa-notes" v-else></i>
                <span>{{ itmem.Note ? "ראה הערה" : "הוסף הערה" }}</span>
              </button>

              <button class="danger-btn" @click="DeleteShiduh(itmem._id)">
                <i class="fa-duotone fa-trash"></i>
                <span>מחיקה</span>
              </button>
            </div>
          </div>

          <draggable
            v-model="itmem.Shiduh"
            group="people"
            @add="evntos($event, itmem)"
            class="match-draggable"
          >
            <div
              v-for="(S, indo) in itmem.Shiduh"
              :key="S._id || indo"
              class="match-person"
              :class="{
                'match-person--man': S.Gender === 'זכר',
                'match-person--woman': S.Gender === 'נקבה',
              }"
            >
              <div class="avatar medium">
                <img
                  v-if="S.picURL"
                  @error="error[`item-${S._id}`] = true"
                  :src="!error[`item-${S._id}`] ? S.picURL : imageError"
                  alt="תמונה"
                />
                <div v-else class="avatar-placeholder">
                  {{ S.Name?.charAt(0) || "?" }}
                </div>
              </div>
              <div class="person-info">
                <div class="name">{{ S.Name }}</div>
                <div class="meta">
                  {{ S.Gender === "זכר" ? "חתן" : "כלה" }} · גיל {{ S.Age }}
                </div>
              </div>
            </div>
          </draggable>

          <div class="match-heart">
            <i
              class="fa-duotone fa-heart"
              style="
                --fa-primary-color: #ffffff;
                --fa-secondary-color: #ffffff;
                --fa-secondary-opacity: 0.6;
              "
            ></i>
          </div>
        </article>
      </div>
    </section>

    <!-- מודאל הערות -->
    <AddNote v-if="ifparamsNote" @sgor="ifparamsNote = false" />

    <!-- פופאפ אישור מחיקה -->
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
          <p>האם אתה בטוח שברצונך למחוק את השידוך הזה?</p>
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
import { computed, provide, reactive, ref, watch } from "vue";
import { useAxios } from "@vueuse/integrations/useAxios";
import { URL } from "@/URL/url";
import { VueDraggableNext } from "vue-draggable-next";
import axios from "axios";
import profil from "@/assets/Profil.jpg";
import AddNote from "./Add-or-read-Note.vue";

export default {
  components: {
    draggable: VueDraggableNext,
    AddNote,
  },

  setup() {
    const ifparamsNote = ref(false);
    const pramso = ref(null);

    const imageError = ref(profil);
    const ifDOM = ref(true);
    const newShi = ref(false);
    const error = reactive({});
    const newSHiduh = ref([]);

    // מאגר גברים/נשים – תמיד מערך, כדי שלא יהיה undefined
    const men = ref([]);
    const women = ref([]);

    // פופאפ אישור מחיקה
    const showDeleteConfirm = ref(false);
    const shiduhToDelete = ref(null);

    const { data, isFinished } = useAxios(URL + "GetShiduhim");
    const { data: resonse, isFinished: finsih } = useAxios(URL + "GetShoduh");

    // כשמגיעים נתונים מהשרת – מעדכן את המערכים
    watch(
      () => data.value,
      (val) => {
        if (!val) return;
        men.value = Array.isArray(val.man) ? val.man : [];
        women.value = Array.isArray(val.woman) ? val.woman : [];
      },
      { immediate: true }
    );

    provide("containor_params", pramso);

    const AddNoteee = (itemem) => {
      const { Note, _id } = itemem;
      pramso.value = { Note, _id };
      ifparamsNote.value = true;
    };

    const AddNewShiduh = () => {
      newShi.value = !newShi.value;
      newSHiduh.value = [];
    };

    const ifSubmit = computed(() => newSHiduh.value.length === 2);

    const cancelDelete = () => {
      showDeleteConfirm.value = false;
      shiduhToDelete.value = null;
    };

    return {
      resonse,
      finsih,
      data,
      isFinished,
      ifDOM,
      AddNewShiduh,
      newShi,
      newSHiduh,
      ifSubmit,
      error,
      imageError,
      AddNoteee,
      ifparamsNote,
      pramso,
      men,
      women,
      showDeleteConfirm,
      shiduhToDelete,
      cancelDelete,
    };
  },

  methods: {
    async InsertNewSHid() {
      const arrids = this.newSHiduh.map((e) => e._id);
      const { data } = await axios.post(URL + "InsertShiduh", arrids);
      if (data) {
        this.AddNewShiduh();
        const res = await axios.get(URL + "GetShoduh");
        this.resonse = res.data;
        window.$toast && window.$toast("השידוך נשמר בהצלחה", "success");
      } else {
        window.$toast && window.$toast("משהו השתבש בשמירת השידוך", "error");
      }
    },

    Evenetdraggable(e) {
      const { newIndex } = e;
      const OOO = this.newSHiduh.findIndex((_, i) => i !== newIndex);

      if (
        this.newSHiduh[OOO] &&
        this.newSHiduh[newIndex].Gender === this.newSHiduh[OOO].Gender
      ) {
        this.newSHiduh.splice(0, 1);
      }

      if (this.newShi && this.newSHiduh.length > 2) {
        const gendro = this.newSHiduh[newIndex].Gender;
        const index = this.newSHiduh.findIndex((e) => e.Gender === gendro);
        this.newSHiduh.splice(index, 1);
      }
    },

    DeleteShiduh(id) {
      this.shiduhToDelete = id;
      this.showDeleteConfirm = true;
    },

    async confirmDelete() {
      if (!this.shiduhToDelete) return;

      try {
        const { data } = await axios.delete(
          URL + "DeleteShiduh/" + this.shiduhToDelete
        );
        if (data) {
          const res = await axios.get(URL + "GetShoduh");
          this.resonse = res.data;
          window.$toast && window.$toast("השידוך נמחק", "success");
        } else {
          window.$toast && window.$toast("מחיקה נכשלה", "error");
        }
      } catch (error) {
        console.error("Error deleting shiduh:", error);
        window.$toast && window.$toast("מחיקה נכשלה", "error");
      } finally {
        this.showDeleteConfirm = false;
        this.shiduhToDelete = null;
      }
    },

    async evntos(e, val) {
      const ID = val._id;
      const arr = val.Shiduh || [];
      const { newIndex } = e;
      const originalArr = arr;

      if (arr.length === 3) {
        const MyGend = originalArr[newIndex].Gender === "זכר" ? "זכר" : "נקבה";
        const index = arr.findIndex(
          (e, i) => e.Gender === MyGend && i !== newIndex
        );
        if (index !== -1) originalArr.splice(index, 1);
      } else {
        originalArr.push(originalArr[newIndex]);
      }

      const newPoten = originalArr.map((e) => e._id);
      const { data } = await axios.put(URL + "EditZog", { newPoten, ID });

      if (data) {
        this.resonse = data;
        window.$toast && window.$toast("השידוך  עודכן", "success");
      } else {
        window.$toast && window.$toast("עדכון  נכשל", "error");
      }
    },

    rafreshDom() {
      this.ifDOM = false;
      setTimeout(() => {
        this.ifDOM = true;
      }, 0);
    },
  },
};
</script>

<style lang="scss" scoped>
.shidduch-container {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.3fr);
  gap: 1.5rem;
  width: 100%;
  height: calc(100vh - 120px);
  box-sizing: border-box;
}

.people-panel,
.matches-panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 1.2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* מאגר מועמדים */
.panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.panel-header p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.people-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
  min-height: 0;
}

.people-list {
  background: #f5f5f7;
  border-radius: 14px;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.people-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.tag-men {
  background: rgba(54, 134, 255, 0.13);
  color: #246bff;
}

.tag-women {
  background: rgba(255, 92, 143, 0.14);
  color: #ff3f7d;
}

.people-draggable {
  overflow-y: auto;
  padding-right: 0.2rem;
  margin-top: 0.3rem;
}

.person-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: white;
  border-radius: 12px;
  padding: 0.45rem 0.6rem;
  margin-bottom: 0.35rem;
  cursor: grab;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s;
}

.person-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.06);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e2e2e2;
}

.avatar.small {
  width: 28px;
  height: 28px;
}

.avatar.medium {
  width: 40px;
  height: 40px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #555;
}

.person-info {
  flex: 1;
  min-width: 0;
}

.person-info .name {
  font-size: 0.9rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.person-info .meta {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* צד השידוכים */
.matches-panel {
  min-height: 0;
}

.matches-panel--compact .matches-list {
  margin-top: 0.75rem;
}

.matches-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.8rem;
}

.matches-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.matches-header p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  opacity: 0.78;
}

/* כפתורים */
.primary-btn,
.danger-btn,
.ghost-btn {
  border-radius: 999px;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: background 0.18s ease, transform 0.1s ease, box-shadow 0.15s ease,
    opacity 0.2s;
}

.primary-btn {
  background: linear-gradient(135deg, #ff6b6b, #f99a4d);
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.35);
  font-weight: 600;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.primary-btn.full-width {
  width: 100%;
  justify-content: center;
}

.danger-btn {
  background: #ff4d4f;
  color: #fff;
}

.danger-btn:hover {
  background: #e64345;
}

.ghost-btn {
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.ghost-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.ghost-btn--highlight {
  border-color: #5779ff;
  color: #5779ff;
}

/* כרטיס יצירת שידוך חדש */
.new-match-card {
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 235, 230, 0.9)
  );
  padding: 0.9rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 170, 140, 0.5);
}

.new-match-title {
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.new-match-description {
  font-size: 0.8rem;
  opacity: 0.75;
  margin-bottom: 0.6rem;
}

.new-match-dropzone {
  border-radius: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  min-height: 72px;
  padding: 0.5rem;
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.7);
}

.new-match-person {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.new-match-person.new-man {
  border: 1px solid #246bff33;
}

.new-match-person.new-woman {
  border: 1px solid #ff3f7d33;
}

.new-match-footer {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
}

.pair-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  opacity: 0.7;
}

.pair-status--ready {
  color: #16a34a;
  opacity: 1;
}

/* כרטיסי שידוך קיימים */
.matches-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.3rem;
  margin-top: 0.4rem;
}

.match-card {
  position: relative;
  background: #fdfdfd;
  border-radius: 14px;
  padding: 0.75rem 0.8rem 0.9rem;
  margin-bottom: 0.7rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.match-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.match-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #f1f1f1;
}

.chip-note {
  background: rgba(87, 121, 255, 0.1);
  color: #5779ff;
}

.match-actions {
  display: flex;
  gap: 0.4rem;
}

.match-draggable {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  flex-wrap: wrap;
}

.match-person {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: #ffffff;
  cursor: grab;
}

.match-person--man {
  border: 1px solid rgba(36, 107, 255, 0.2);
}

.match-person--woman {
  border: 1px solid rgba(255, 63, 125, 0.2);
}

.match-heart {
  position: absolute;
  left: 0.7rem;
  bottom: 0.6rem;
  opacity: 0.3;
  font-size: 0.9rem;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 3px;
  height: 10px;
  background-color: #f9f9f9;
}

::-webkit-scrollbar:hover {
  background-color: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* מובייל */
@media (max-width: 900px) {
  .shidduch-container {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    height: auto;
  }

  .people-panel,
  .matches-panel {
    height: auto;
    max-height: 65vh;
  }

  .matches-panel {
    order: -1;
  }
}

@media (max-width: 600px) {
  .people-columns {
    grid-template-columns: 1fr;
  }

  .matches-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .matches-header p {
    margin-bottom: 0.35rem;
  }

  .match-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .match-card {
    padding-bottom: 1.4rem;
  }

  .match-heart {
    bottom: 0.35rem;
  }
}

/* פופאפ אישור מחיקה */
.delete-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.delete-confirm-dialog {
  background: linear-gradient(135deg, #1a0318, #2b0630);
  border-radius: 20px;
  padding: 1.5rem;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 200, 255, 0.3);
  color: #ffffff;
  direction: rtl;
}

.delete-confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);

  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
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
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &--cancel {
    background: rgba(148, 163, 184, 0.3);
    color: #e5e7eb;

    &:hover {
      background: rgba(148, 163, 184, 0.5);
      transform: translateY(-1px);
    }
  }

  &--confirm {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.5);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.7);
      filter: brightness(1.1);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
