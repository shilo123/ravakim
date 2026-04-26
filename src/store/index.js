import { createStore } from "vuex";
import axios from "axios";
import { URL } from "@/URL/url";

export default createStore({
  state: {
    isFinished: false,
    activeIsh: null,
    isDelete: false,
    isUpdate: false,
  },
  getters: {},
  mutations: {
    updateisFinished(state, val) {
      state.isFinished = val;
    },
    UpdateActiveIsh(state, val) {
      state.activeIsh = val;
    },
    UpdateState(state, val) {
      state.isDelete = !!val.Delete;
      state.isUpdate = !!val.Update;
    },
  },

  actions: {
    async GetDetalis({ commit }, id) {
      const { data } = await axios.get(URL + "GetDetalis/" + id);
      commit("UpdateActiveIsh", data);
    },

    async DelteUser(_, id) {
      // אם ה-API שלך באמת GET למחיקה, תשאיר GET
      // אם תשנה בעתיד למחיקה אמיתית – תעשה axios.delete
      const { data } = await axios.get(`${URL}DeleteUser/${id}`);
      // נניח שהשרת מחזיר true/false
      return data;
    },
  },

  modules: {},
});
