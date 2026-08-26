/**
 * 属性.sync的双向绑定
 * @param propName
 * @param internalValue
 * @param lazyValue
 * @returns {{data: (function(): {}), computed: {[p: string]: {set(*): void, get(): *}}, watch: {}, created(): void, props: *[]}|*}
 */
export const sync = function (propName, internalValue = `internal_${propName}`, lazyValue = `lazy_${propName}`) {
  return {
    props: [propName], data: () => ({
      [lazyValue]: null
    }), computed: {
      [internalValue]: {
        get() {
          return this[lazyValue]
        }, set(val) {
          this[lazyValue] = val
          this.$emit(`update:${propName}`, val)
        }
      }
    }, watch: {
      [propName]: {
        deep: true, handler: function (val) {
          this[lazyValue] = val
        }
      }
    }, created() {
      this[lazyValue] = this[propName]
    }
  }
}

/**
 * v-module值绑定
 * @param internalValue
 * @param lazyValue
 * @returns {{data: (function(): {}), computed: {}, watch: {value: {handler: watch.value.handler, deep: boolean}}, created(): void, props: string[]}|*}
 */
const value = function (internalValue = "internalValue", lazyValue = "lazyValue") {
  return {
    props: ['value'], data: () => ({
      [lazyValue]: null
    }), computed: {
      [internalValue]: {
        get() {
          return this[lazyValue]
        }, set(val) {
          this[lazyValue] = val
          this.$emit("input", val)
        }
      }
    }, watch: {
      value: {
        deep: true, handler: function (val) {
          this[lazyValue] = val
        }
      }
    }, created() {
      this[lazyValue] = this.value
    }
  }
}

export default value
