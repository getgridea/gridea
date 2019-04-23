import _Vue from 'vue'

declare module 'vue/types/vue' {
    interface Vue {
        $bus: any
    }
}
class VueBus {
  static install(Vue: any, options: any) {
    const bus = new Vue()
    Vue.bus = bus
    Vue.prototype.$bus = bus
  }
}
// eslint-disable-next-line
if ('Vue' in window) {
  _Vue.use(VueBus)
}
export default VueBus
