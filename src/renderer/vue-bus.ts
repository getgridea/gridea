import Vue from 'vue'
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
    };
};
if ('Vue' in window) {
    Vue.use(VueBus)
}
export default VueBus