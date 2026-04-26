import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import InputForm from "@/components/Home/InputForm.vue";
import InputSerch from "@/components/Admin/Elements/InputSerch.vue";
import router from "./router";
import store from "./store";
import "../FileTheFontAwemson/css/all.css"; // כולל את כל הסגנונות
import "../FileTheFontAwemson/css/all.min.css"; // כולל את כל הסגנונות
import "../FileTheFontAwemson/css/brands.css"; // כולל את כל האייקונים של המותגים
import "../FileTheFontAwemson/css/brands.min.css"; // כולל את כל האייקונים של המותגים
import "../FileTheFontAwemson/css/fontawesome.min.css"; // הקובץ המרכזי של Font Awesome
import "../FileTheFontAwemson/css/solid.min.css"; // כולל אייקונים בסגנון מלא
import "../FileTheFontAwemson/css/regular.min.css"; // כולל אייקונים בסגנון רגיל
import "../FileTheFontAwemson/css/light.min.css"; // כולל אייקונים בסגנון דק
import "../FileTheFontAwemson/css/thin.min.css"; // כולל אייקונים בסגנון דק מאוד
import "../FileTheFontAwemson/css/duotone.css"; // כולל אייקונים בסגנון דו-גווני
import "../FileTheFontAwemson/css/duotone.min.css"; // כולל אייקונים בסגנון דו-גווני
import "../FileTheFontAwemson/css/v4-shims.min.css"; // עבור תאימות עם גרסה 4
import "../FileTheFontAwemson/css/svg-with-js.min.css"; // עבור שילוב עם JavaScript ו-SVG
import "../FileTheFontAwemson/css/sharp-solid.min.css"; // סגנון נוסף של אייקונים מלאים

// createApp(App).component("input-form", InputForm);
const app = createApp(App);
app.component("input-form", InputForm);
app.component("input-Serch", InputSerch);

app.use(store).use(router).use(ElementPlus).mount("#app");
