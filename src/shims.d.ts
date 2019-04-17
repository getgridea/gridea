import { AllElectron } from 'electron'
import * as dayjs from 'dayjs'

declare module 'vue/types/vue' {
  interface Vue {
    readonly $electron: AllElectron,
    $dayjs: any,
    $bus: any,
  }
}
