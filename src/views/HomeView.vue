<template>
  <div class="intro-page" dir="rtl">
    <!-- מסך הטופס -->
    <div v-if="!Zehu" class="intro-shell">
      <!-- כותרת -->
      <header class="intro-header">
        <div class="intro-header__logo-ring">
          <img src="/Logo.jpg" alt="לוגו" class="intro-header__logo" />
        </div>
        <p class="intro-header__eyebrow">בעז״ה · עוד השנה</p>
        <h1 class="intro-header__title">טופס היכרות</h1>
        <div class="intro-header__rule">
          <span class="intro-header__rule-line"></span>
          <span class="intro-header__rule-heart">♥</span>
          <span class="intro-header__rule-line"></span>
        </div>
        <p class="intro-header__note">
          כדי לא "לאבד" אף רווק\ה יצרתי לי מאגר משלי.<br />
          הלוואי ותמצא\י כבר את החצי השני שלך.
        </p>
      </header>

      <!-- פס התקדמות -->
      <div class="progress">
        <div class="progress__track">
          <div
            class="progress__fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
        <span class="progress__label"
          >{{ filledCount }} מתוך {{ requiredCount }} שדות מולאו</span
        >
      </div>

      <!-- כרטיס הטופס -->
      <div class="card">
        <!-- אינדיקטור שלבים (מובייל בלבד) -->
        <div v-if="isMobile" class="wizard-head">
          <span class="wizard-head__count"
            >שלב {{ step + 1 }} מתוך {{ totalSteps }}</span
          >
          <div class="wizard-head__dots">
            <span
              v-for="(s, i) in STEPS"
              :key="i"
              class="wizard-head__dot"
              :class="{
                'is-active': i === step,
                'is-done': i < step,
              }"
            ></span>
          </div>
        </div>

        <!-- 1. פרטים אישיים -->
        <section v-if="showSection(0)" class="section" :class="sectionAnimClass">
          <div class="section__head">
            <span class="section__num">א</span>
            <div>
              <h2 class="section__title">פרטים אישיים</h2>
              <p class="section__sub">מי את/ה ואיך יוצרים קשר</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field__label">שם מלא</label>
              <input
                v-model="Form.Name"
                type="text"
                class="field__input"
                placeholder="הקלד/י שם מלא"
              />
            </div>
            <div class="field">
              <label class="field__label">מספר טלפון</label>
              <input
                v-model="Form.phone"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                class="field__input"
                placeholder="050-0000000"
              />
            </div>
            <div class="field">
              <label class="field__label">תאריך לידה</label>
              <input v-model="Form.BirthDate" type="date" class="field__input" />
            </div>
            <div class="field">
              <label class="field__label">כתובת מגורים</label>
              <input
                v-model="Form.Address"
                type="text"
                class="field__input"
                placeholder="עיר / יישוב"
              />
            </div>
          </div>

          <div class="field">
            <label class="field__label">עיסוק / מוסד לימודים</label>
            <input
              v-model="Form.IsuckOrMosadLimudim"
              type="text"
              class="field__input"
              placeholder="מה את/ה עושה ביומיום?"
            />
          </div>

          <div class="field">
            <span class="field__label">מגדר</span>
            <div class="gender">
              <label class="gender__option">
                <input
                  type="radio"
                  value="זכר"
                  v-model="Form.Gender"
                  name="gender"
                />
                <span>גבר</span>
              </label>
              <label class="gender__option">
                <input
                  type="radio"
                  value="נקבה"
                  v-model="Form.Gender"
                  name="gender"
                />
                <span>אישה</span>
              </label>
            </div>
          </div>
        </section>

        <hr v-if="!isMobile" class="divider" />

        <!-- 2. רקע ואופי -->
        <section v-if="showSection(1)" class="section" :class="sectionAnimClass">
          <div class="section__head">
            <span class="section__num">ב</span>
            <div>
              <h2 class="section__title">רקע ואופי</h2>
              <p class="section__sub">רמה דתית, סטטוס ותכונות</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field__label">רמה דתית</label>
              <input
                v-model="Form.RamaDatit"
                type="text"
                class="field__input"
                placeholder="דתי לאומי / מסורתי / חרדי..."
              />
            </div>
            <div class="field">
              <label class="field__label">סטטוס</label>
              <input
                v-model="Form.Status"
                type="text"
                class="field__input"
                placeholder="רווק/ה, גרוש/ה, אלמן/ה..."
              />
            </div>
          </div>

          <div class="field">
            <label class="field__label">תכונות אופי</label>
            <textarea
              v-model="Form.Ofi"
              rows="3"
              class="field__input field__input--area"
              placeholder="איך היית מתאר/ת את האופי שלך בכמה מילים?"
            ></textarea>
          </div>
        </section>

        <hr v-if="!isMobile" class="divider" />

        <!-- 3. תחביבים וציפיות -->
        <section v-if="showSection(2)" class="section" :class="sectionAnimClass">
          <div class="section__head">
            <span class="section__num">ג</span>
            <div>
              <h2 class="section__title">תחביבים וציפיות</h2>
              <p class="section__sub">מה עושה לך טוב, ומה חשוב לך בצד השני</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field__label">תחביבים</label>
              <textarea
                v-model="Form.Hobits"
                rows="3"
                class="field__input field__input--area"
                placeholder="מה עושה לך טוב בזמן הפנוי?"
              ></textarea>
            </div>
            <div class="field">
              <label class="field__label">מה את/ה מחפש/ת?</label>
              <textarea
                v-model="Form.MaMehapes"
                rows="3"
                class="field__input field__input--area"
                placeholder="מה חשוב לך למצוא בצד השני?"
              ></textarea>
            </div>
          </div>
        </section>

        <hr v-if="!isMobile" class="divider" />

        <!-- 4. המשפחה -->
        <section v-if="showSection(3)" class="section" :class="sectionAnimClass">
          <div class="section__head">
            <span class="section__num">ד</span>
            <div>
              <h2 class="section__title">המשפחה שלך</h2>
              <p class="section__sub">תיאור קצר של הבית שממנו באת</p>
            </div>
          </div>

          <div class="field">
            <label class="field__label">תאר/י בקווים כלליים את משפחתך</label>
            <textarea
              v-model="Form.KavimClalim"
              rows="3"
              class="field__input field__input--area"
              placeholder="מספר אחים, אווירה בבית, רקע כללי..."
            ></textarea>
          </div>
        </section>

        <hr v-if="!isMobile" class="divider" />

        <!-- 5. תמונה וסרטון -->
        <section v-if="showSection(4)" class="section" :class="sectionAnimClass">
          <div class="section__head">
            <span class="section__num">ה</span>
            <div>
              <h2 class="section__title">תמונה וסרטון</h2>
              <p class="section__sub">תמונה אחת ברורה ומכובדת 😊 · סרטון לא חובה</p>
            </div>
          </div>

          <div class="media-row">
            <!-- תמונה -->
            <div class="media-box">
              <!-- מצב העלאה: טבעת מסתובבת + אחוזים -->
              <div v-if="uploadingPic" class="upload-circle upload-circle--busy">
                <span class="upload-spinner"></span>
                <span class="upload-circle__percent">{{ picProgress }}%</span>
                <span class="upload-circle__text">מעלה את התמונה...</span>
              </div>

              <div v-else-if="Form.picURL" class="avatar">
                <img :src="Form.picURL" class="avatar__img" alt="תמונה" />
                <label class="avatar__change">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileChange"
                    hidden
                  />
                  החלפת תמונה
                </label>
              </div>

              <label v-else class="upload-circle">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFileChange"
                  hidden
                />
                <span class="upload-circle__icon">+</span>
                <span class="upload-circle__text">העלאת תמונה</span>
              </label>
            </div>

            <!-- סרטון -->
            <div class="media-box">
              <label
                class="video-btn"
                :class="{ 'video-btn--busy': uploadingVideo }"
              >
                <input
                  type="file"
                  accept="video/*"
                  @change="handleVideoChange"
                  :disabled="uploadingVideo"
                  hidden
                />
                <span v-if="!uploadingVideo">🎬 העלאת סרטון קצר</span>
                <span v-else>מעלה סרטון... {{ videoProgress }}%</span>
              </label>
              <div v-if="uploadingVideo" class="upload-bar">
                <div
                  class="upload-bar__fill"
                  :style="{ width: videoProgress + '%' }"
                ></div>
              </div>
              <video
                v-if="Form.videoURL && !uploadingVideo"
                :src="Form.videoURL"
                controls
                class="video-preview"
              ></video>
            </div>
          </div>
        </section>

        <!-- ניווט Wizard (מובייל בלבד) -->
        <div v-if="isMobile" class="wizard-nav">
          <button
            v-if="step > 0"
            class="wizard-nav__back"
            @click="prevStep"
          >
            חזרה
          </button>
          <button
            v-if="step < totalSteps - 1"
            class="wizard-nav__next"
            @click="nextStep"
          >
            הבא ←
          </button>
          <button
            v-else
            class="submit wizard-nav__submit"
            @click="Submit"
            :disabled="LoadingB || uploadingPic || uploadingVideo"
          >
            <span v-if="!LoadingB">שליחת הפרטים</span>
            <span v-else>שולח...</span>
          </button>
        </div>

        <!-- שליחה (דסקטופ) -->
        <button
          v-if="!isMobile"
          class="submit"
          @click="Submit"
          :disabled="LoadingB || uploadingPic || uploadingVideo"
        >
          <span v-if="!LoadingB">שליחת הפרטים</span>
          <span v-else>שולח...</span>
        </button>
        <p class="submit__hint">הפרטים נשמרים אצלי בלבד ולא מתפרסמים.</p>
      </div>

      <footer class="intro-footer">בקרוב אצלך 🙏</footer>
    </div>

    <!-- מסך תודה -->
    <div v-else class="thanks">
      <div class="thanks__card">
        <div class="thanks__heart">♥</div>
        <h1 class="thanks__title">תודה רבה על הפרטים</h1>
        <div class="intro-header__rule">
          <span class="intro-header__rule-line"></span>
          <span class="intro-header__rule-heart">♥</span>
          <span class="intro-header__rule-line"></span>
        </div>
        <p class="thanks__text">ניצור קשר אחרי שנעבור על הכל.<br />בעז״ה עוד השנה!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { URL } from "@/URL/url";
import { upload } from "@vercel/blob/client";
import axios from "axios";

export default {
  setup() {
    const Form = reactive({});
    const Zehu = ref(false);
    const LoadingB = ref(false);
    const uploadingPic = ref(false);
    const uploadingVideo = ref(false);
    const picProgress = ref(0);
    const videoProgress = ref(0);

    const MAX_IMAGE_MB = 10;
    const MAX_VIDEO_MB = 200;

    const REQUIRED_FIELDS = [
      "Name",
      "phone",
      "IsuckOrMosadLimudim",
      "BirthDate",
      "Address",
      "RamaDatit",
      "Status",
      "Ofi",
      "Hobits",
      "MaMehapes",
      "KavimClalim",
      "Gender",
      "picURL",
    ];

    const FIELD_ERRORS = {
      Name: "לא מלאת שם",
      phone: "לא מלאת מספר טלפון",
      IsuckOrMosadLimudim: "לא מלאת עיסוק\\מוסד לימודים",
      BirthDate: "לא מלאת תאריך לידה",
      Address: "לא מלאת כתובת מגורים",
      RamaDatit: "לא מלאת רמה דתית",
      Status: "לא מלאת סטטוס",
      Ofi: "לא מלאת אופי",
      Hobits: "לא מלאת תחביבים",
      MaMehapes: "לא אמרת מה אתה מחפש",
      KavimClalim: "לא תיארת את משפחתך",
      Gender: "לא תיארת מגדר",
      picURL: "חובה להוסיף תמונה",
    };

    // Wizard במובייל: שלב לכל סקשן
    const STEPS = [
      {
        fields: [
          "Name",
          "phone",
          "BirthDate",
          "Address",
          "IsuckOrMosadLimudim",
          "Gender",
        ],
      },
      { fields: ["RamaDatit", "Status", "Ofi"] },
      { fields: ["Hobits", "MaMehapes"] },
      { fields: ["KavimClalim"] },
      { fields: ["picURL"] },
    ];
    const totalSteps = STEPS.length;
    const step = ref(0);
    const isMobile = ref(false);
    const navDirection = ref("next");

    let mq = null;
    const mqHandler = (e) => {
      isMobile.value = e.matches;
    };
    onMounted(() => {
      mq = window.matchMedia("(max-width: 640px)");
      isMobile.value = mq.matches;
      mq.addEventListener("change", mqHandler);
    });
    onBeforeUnmount(() => {
      if (mq) mq.removeEventListener("change", mqHandler);
    });

    const showSection = (i) => !isMobile.value || step.value === i;

    const firstMissing = (fields) =>
      fields.find((f) => !Form[f] || String(Form[f]).trim() === "");

    const scrollTop = () =>
      window.scrollTo({ top: 0, behavior: "smooth" });

    const nextStep = () => {
      const missing = firstMissing(STEPS[step.value].fields);
      if (missing) {
        showError(FIELD_ERRORS[missing]);
        return;
      }
      if (step.value === 0 && (!validatePhone() || !validateBirthDate())) {
        return;
      }
      if (step.value < totalSteps - 1) {
        navDirection.value = "next";
        step.value++;
        scrollTop();
      }
    };

    const prevStep = () => {
      if (step.value > 0) {
        navDirection.value = "back";
        step.value--;
        scrollTop();
      }
    };

    const sectionAnimClass = computed(() =>
      isMobile.value
        ? navDirection.value === "back"
          ? "section--anim-back"
          : "section--anim-next"
        : ""
    );

    const requiredCount = REQUIRED_FIELDS.length;
    const filledCount = computed(
      () =>
        REQUIRED_FIELDS.filter((f) => Form[f] && String(Form[f]).trim() !== "")
          .length
    );
    const progressPercent = computed(() =>
      Math.round((filledCount.value / requiredCount) * 100)
    );

    const showError = (msg) => {
      if (window.$toast) {
        window.$toast(msg || "משהו השתבש ❌", "error");
      } else {
        alert(msg || "משהו השתבש ❌");
      }
    };

    const normalizeBirthDate = (birthDateStr) => {
      if (!birthDateStr) return null;
      const d = new Date(birthDateStr);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    };

    // ולידציות מעבר לשדות-חובה: טלפון וגיל הגיוני
    const validatePhone = () => {
      if (!/^\d{10}$/.test(String(Form.phone || "").trim())) {
        showError("מספר טלפון חייב להכיל בדיוק 10 ספרות");
        return false;
      }
      return true;
    };

    const validateBirthDate = () => {
      const d = new Date(Form.BirthDate);
      if (isNaN(d.getTime())) {
        showError("תאריך לידה לא תקין");
        return false;
      }
      const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 16 || age > 120) {
        showError("תאריך הלידה לא הגיוני, בדוק/י שוב");
        return false;
      }
      return true;
    };

    const Submit = async () => {
      try {
        LoadingB.value = true;

        const bool = REQUIRED_FIELDS.every(
          (f) => Form[f] && String(Form[f]).trim() !== ""
        );

        if (bool) {
          if (!validatePhone() || !validateBirthDate()) {
            LoadingB.value = false;
            return;
          }
          const payload = { ...Form };

          const normalizedBirthDate = normalizeBirthDate(Form.BirthDate);
          if (normalizedBirthDate) {
            payload.BirthDate = normalizedBirthDate;
          }
          delete payload.Age;

          const { data } = await axios.post(URL + "ADDForm", payload);
          LoadingB.value = false;

          if (data) {
            Object.keys(Form).forEach((key) => {
              Form[key] = "";
            });
            Zehu.value = true;
          } else {
            showError("משהו השתבש בשליחה, נסה/י שוב");
          }
        } else {
          const missing = firstMissing(REQUIRED_FIELDS);
          if (missing) showError(FIELD_ERRORS[missing]);
          LoadingB.value = false;
        }
      } catch (error) {
        LoadingB.value = false;
        showError("משהו השתבש");
      }
    };

    const uploadToBlob = async (file, folder, progressRef) => {
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const { url } = await upload(`${folder}/${Date.now()}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: ({ percentage }) => {
          progressRef.value = Math.round(percentage);
        },
      });
      return url;
    };

    const handleFileChange = async (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        showError("אפשר להעלות רק קובץ תמונה");
        return;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        showError(`התמונה גדולה מדי (מקסימום ${MAX_IMAGE_MB}MB)`);
        return;
      }
      try {
        uploadingPic.value = true;
        picProgress.value = 0;
        Form.picURL = await uploadToBlob(file, "images", picProgress);
        window.$toast && window.$toast("התמונה עלתה בהצלחה ✅", "success");
      } catch (e) {
        showError("העלאת התמונה נכשלה, נסה/י שוב");
      } finally {
        uploadingPic.value = false;
      }
    };

    const handleVideoChange = async (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        showError("אפשר להעלות רק קובץ וידאו");
        return;
      }
      if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
        showError(`הסרטון גדול מדי (מקסימום ${MAX_VIDEO_MB}MB)`);
        return;
      }
      try {
        uploadingVideo.value = true;
        videoProgress.value = 0;
        Form.videoURL = await uploadToBlob(file, "videos", videoProgress);
        window.$toast && window.$toast("הסרטון עלה בהצלחה ✅", "success");
      } catch (e) {
        showError("העלאת הסרטון נכשלה, נסה/י שוב");
      } finally {
        uploadingVideo.value = false;
      }
    };

    return {
      Form,
      Zehu,
      LoadingB,
      uploadingPic,
      uploadingVideo,
      picProgress,
      videoProgress,
      requiredCount,
      filledCount,
      progressPercent,
      STEPS,
      totalSteps,
      step,
      isMobile,
      sectionAnimClass,
      showSection,
      nextStep,
      prevStep,
      Submit,
      handleFileChange,
      handleVideoChange,
    };
  },
};
</script>

<style scoped lang="scss">
// ---- לוח צבעים: הזמנה לחתונה ----
$ivory: #faf5ec;
$paper: #fffdf8;
$ink: #33261c;
$muted: #8d7f6d;
$wine: #8c2f39;
$wine-deep: #6f2129;
$gold: #c9a227;
$gold-soft: #e6d3a3;
$line: #e8ddc8;

.intro-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at 15% -5%, rgba(201, 162, 39, 0.14), transparent 45%),
    radial-gradient(ellipse at 90% 8%, rgba(140, 47, 57, 0.08), transparent 40%),
    radial-gradient(ellipse at 50% 110%, rgba(201, 162, 39, 0.12), transparent 50%),
    $ivory;
  font-family: "Heebo", "Assistant", sans-serif;
  color: $ink;
  padding: clamp(20px, 4vw, 56px) 16px 40px;
}

.intro-shell {
  max-width: 860px;
  margin: 0 auto;
  animation: rise 0.6s ease both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

// ---- כותרת ----
.intro-header {
  text-align: center;
  margin-bottom: 26px;
}

.intro-header__logo-ring {
  width: 108px;
  height: 108px;
  margin: 0 auto 14px;
  border-radius: 999px;
  padding: 4px;
  background: conic-gradient(from 120deg, $gold, $gold-soft, $wine, $gold);
  box-shadow: 0 14px 34px rgba(140, 47, 57, 0.22);
}

.intro-header__logo {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  display: block;
  background: $paper;
}

.intro-header__eyebrow {
  margin: 0 0 4px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: $gold;
  text-transform: uppercase;
}

.intro-header__title {
  margin: 0;
  font-family: "Frank Ruhl Libre", serif;
  font-weight: 900;
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  line-height: 1.1;
  color: $wine-deep;
}

.intro-header__rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 12px auto 14px;
  max-width: 300px;
}

.intro-header__rule-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to left, transparent, $gold, transparent);
}

.intro-header__rule-heart {
  color: $wine;
  font-size: 0.85rem;
}

.intro-header__note {
  margin: 0 auto;
  max-width: 520px;
  font-size: 1rem;
  line-height: 1.7;
  color: $muted;
}

// ---- פס התקדמות ----
.progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding: 0 4px;
}

.progress__track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: $line;
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(to left, $gold, $wine);
  transition: width 0.35s ease;
}

.progress__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: $muted;
  white-space: nowrap;
}

// ---- כרטיס ----
.card {
  background: $paper;
  border: 1px solid $line;
  border-radius: 22px;
  padding: clamp(20px, 4vw, 40px);
  box-shadow: 0 30px 60px -24px rgba(51, 38, 28, 0.25),
    0 2px 6px rgba(51, 38, 28, 0.05);
}

// ---- Wizard (מובייל) ----
.wizard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid $line;
}

.wizard-head__count {
  font-size: 0.82rem;
  font-weight: 700;
  color: $wine;
}

.wizard-head__dots {
  display: flex;
  gap: 7px;
}

.wizard-head__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: $line;
  transition: all 0.25s ease;

  &.is-done {
    background: $gold;
  }

  &.is-active {
    background: $wine;
    transform: scale(1.35);
    box-shadow: 0 0 0 3px rgba(140, 47, 57, 0.15);
  }
}

.wizard-nav {
  display: flex;
  gap: 10px;
  margin-top: 26px;
}

.wizard-nav__back {
  flex: 0 0 auto;
  padding: 13px 22px;
  border-radius: 999px;
  border: 1.5px solid $line;
  background: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: $muted;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: $gold-soft;
    color: $ink;
  }
}

.wizard-nav__next {
  flex: 1;
  padding: 13px 0;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  color: #fff8f0;
  cursor: pointer;
  background: linear-gradient(135deg, $wine, $wine-deep);
  box-shadow: 0 14px 28px -10px rgba(140, 47, 57, 0.6);
  transition: transform 0.15s ease, filter 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
}

.wizard-nav__submit {
  flex: 1;
  margin-top: 0;
}

// ---- סקשנים ----
.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: rise 0.3s ease both;

  // מעבר בין שלבים ב-Wizard: החלקה עדינה לפי כיוון
  &--anim-next {
    animation: stepNext 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  &--anim-back {
    animation: stepBack 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

@keyframes stepNext {
  from {
    opacity: 0;
    transform: translateX(-26px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes stepBack {
  from {
    opacity: 0;
    transform: translateX(26px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.section__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section__num {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-family: "Frank Ruhl Libre", serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: $wine-deep;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.18), rgba(201, 162, 39, 0.05));
  border: 1px solid $gold-soft;
}

.section__title {
  margin: 0;
  font-family: "Frank Ruhl Libre", serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: $ink;
}

.section__sub {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: $muted;
}

.divider {
  border: none;
  height: 1px;
  margin: 26px 0;
  background: linear-gradient(to left, transparent, $line 20%, $line 80%, transparent);
}

// ---- שדות ----
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: $ink;
}

.field__input {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid $line;
  border-radius: 12px;
  background: #fff;
  padding: 11px 14px;
  font-size: 1rem;
  font-family: inherit;
  color: $ink;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: #bcae99;
  }

  &:focus {
    outline: none;
    border-color: $wine;
    box-shadow: 0 0 0 3px rgba(140, 47, 57, 0.12);
  }

  &--area {
    resize: vertical;
    min-height: 76px;
    line-height: 1.6;
  }
}

// ---- מגדר ----
.gender {
  display: flex;
  gap: 10px;
}

.gender__option {
  flex: 1;
  cursor: pointer;

  input {
    display: none;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 11px 0;
    border-radius: 12px;
    border: 1.5px solid $line;
    background: #fff;
    font-weight: 600;
    font-size: 0.95rem;
    color: $muted;
    transition: all 0.18s ease;
  }

  input:checked + span {
    background: $wine;
    border-color: $wine;
    color: #fff8f0;
    box-shadow: 0 10px 22px -8px rgba(140, 47, 57, 0.55);
  }

  &:hover input:not(:checked) + span {
    border-color: $gold-soft;
    color: $ink;
  }
}

// ---- מדיה ----
.media-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 22px;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}

.media-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

// מצב העלאה של תמונה: טבעת מסתובבת + אחוזים
.upload-circle--busy {
  cursor: default;
  position: relative;
  border-style: solid;
  border-color: $gold-soft;
  background: rgba(201, 162, 39, 0.08);

  &:hover {
    transform: none;
    background: rgba(201, 162, 39, 0.08);
  }
}

.upload-spinner {
  position: absolute;
  inset: -2px;
  border-radius: 999px;
  border: 3px solid transparent;
  border-top-color: $wine;
  border-left-color: $gold;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.upload-circle__percent {
  font-family: "Frank Ruhl Libre", serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: $wine-deep;
  line-height: 1;
}

// פס התקדמות להעלאת וידאו
.upload-bar {
  width: 100%;
  max-width: 340px;
  height: 7px;
  border-radius: 999px;
  background: $line;
  overflow: hidden;
}

.upload-bar__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(to left, $gold, $wine);
  transition: width 0.25s ease;
}

.video-btn--busy {
  cursor: progress;
  border-color: $gold;
  background: rgba(201, 162, 39, 0.06);
  color: $wine-deep;
}

.upload-circle {
  width: 138px;
  height: 138px;
  border-radius: 999px;
  border: 2px dashed $gold;
  background: rgba(201, 162, 39, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(201, 162, 39, 0.14);
    transform: translateY(-2px);
  }
}

.upload-circle__icon {
  font-size: 1.8rem;
  line-height: 1;
  color: $wine;
  font-weight: 300;
}

.upload-circle__text {
  font-size: 0.82rem;
  font-weight: 600;
  color: $ink;
}

.avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar__img {
  width: 138px;
  height: 138px;
  border-radius: 999px;
  object-fit: cover;
  border: 3px solid $gold;
  box-shadow: 0 12px 28px -10px rgba(51, 38, 28, 0.4);
}

.avatar__change {
  font-size: 0.8rem;
  font-weight: 600;
  color: $wine;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: $wine-deep;
  }
}

.video-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 340px;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1.5px solid $line;
  background: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  color: $ink;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: $gold;
    background: rgba(201, 162, 39, 0.06);
  }
}

.video-preview {
  width: 100%;
  max-width: 340px;
  max-height: 220px;
  border-radius: 14px;
  border: 1px solid $line;
  background: #000;
}

// ---- שליחה ----
.submit {
  width: 100%;
  margin-top: 28px;
  padding: 15px 0;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff8f0;
  cursor: pointer;
  background: linear-gradient(135deg, $wine, $wine-deep);
  box-shadow: 0 18px 36px -12px rgba(140, 47, 57, 0.65);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &:hover:enabled {
    transform: translateY(-2px);
    box-shadow: 0 24px 44px -12px rgba(140, 47, 57, 0.75);
    filter: brightness(1.06);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}

.submit__hint {
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.8rem;
  color: $muted;
}

.intro-footer {
  text-align: center;
  margin-top: 26px;
  font-size: 0.85rem;
  color: $muted;
}

// ---- מסך תודה ----
.thanks {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thanks__card {
  background: $paper;
  border: 1px solid $line;
  border-radius: 22px;
  padding: clamp(32px, 6vw, 56px);
  max-width: 480px;
  text-align: center;
  box-shadow: 0 30px 60px -24px rgba(51, 38, 28, 0.25);
  animation: rise 0.5s ease both;
}

.thanks__heart {
  font-size: 2rem;
  color: $wine;
  margin-bottom: 8px;
  animation: heartbeat 1.6s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  12% {
    transform: scale(1.18);
  }
  24% {
    transform: scale(1);
  }
  36% {
    transform: scale(1.12);
  }
}

.thanks__title {
  margin: 0;
  font-family: "Frank Ruhl Libre", serif;
  font-weight: 900;
  font-size: clamp(1.7rem, 5vw, 2.3rem);
  color: $wine-deep;
}

.thanks__text {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.8;
  color: $muted;
}
</style>
