export default interface ISnackbar {
  /**
   * 通知颜色：success, info, error 或其他颜色
   * default: success
   */
  color?: string
  snackbar?: boolean
  message?: string
  bottom?: boolean
}
