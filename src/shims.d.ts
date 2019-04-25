import { AllElectron } from 'electron'

declare module 'vue/types/vue' {
  interface Vue {
    readonly $electron: AllElectron,
    $bus: any,
  }
}
