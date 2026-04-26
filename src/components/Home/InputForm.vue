<template>
  <div>
    <div class="form" dir="rtl">
      <label for="Inpi">{{ Label }}</label>
      <input
        name="Inpi"
        class="input"
        :placeholder="Pleace"
        @focus="focus = true"
        @blur="focus = false"
        :value="modelValue"
        @input="emito($event.target.value)"
        :maxlength="type === 'Number' ? '10' : '100'"
        :type="type === 'Number' ? 'number' : 'text'"
        max="10"
      />
      <span class="input_border" v-show="!focus"></span>
      <span class="input-border"></span>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
//="phone"
export default {
  props: ["modelValue", "Label", "Pleace", "type"],

  setup(props, { emit }) {
    onMounted(() => {
      document
        .querySelector('input[type="number"]')
        .addEventListener("input", function (e) {
          if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
          }
        });
    });

    const focus = ref(false);

    const emito = (text) => {
      emit("update:modelValue", text);
    };
    return { focus, emito };
  },
};
</script>
<style lang="scss" scoped>
.form {
  --width-of-input: 200px;
  --border-height: 1px;
  --border-before-color: rgba(221, 221, 221, 0.39);
  --border-after-color: #5891ff;
  --input-hovered-color: #4985e01f;
  position: relative;
  width: var(--width-of-input);
  color: black;
  .input {
    color: #fff;
    font-size: 0.9rem;
    // background-color: transparent;
    background: none;
    width: 100%;
    box-sizing: border-box;
    padding-inline: 0.5em;
    padding-block: 0.7em;
    border: none;
    border-bottom: var(--border-height) solid var(--border-before-color);
    color: black !important;
    &-border {
      position: absolute;
      background: var(--border-after-color);
      width: 0%;
      height: 2px;
      bottom: 0;
      right: 0;
      transition: 0.3s;
    }
  }
  input {
    &:hover {
      //   background: var(--input-hovered-color);
      background: none;
    }
    &:focus {
      outline: none;
    }
    &::placeholder {
      font-size: 12px;
    }
  }

  input:focus ~ .input-border {
    width: 100%;
  }
  .input_border {
    width: 100%;
    background: #000;
    height: 1px;
    position: absolute;
    bottom: 0px;
    left: 0;
  }
}
label {
  font-size: 15px;
}
input {
  z-index: 99999999;
}
/* styling of Input */
</style>
