import Model from './model'
import { IMenu } from './interfaces/menu'

export default class Menus extends Model {
  list() {
    const menus = this.$posts.get('menus').value()
    return menus
  }

  public async saveMenu(menu: IMenu) {
    const menus = await this.$posts.get('menus').value()
    if (typeof menu.index === 'number') {
      const { index } = menu
      delete menu.index
      menus[index] = menu
    } else {
      delete menu.index
      menus.push(menu)
    }

    await this.$posts.set('menus', menus).write()
    return menus
  }

  public async saveMenus(menus: IMenu[]) {
    await this.$posts.set('menus', menus).write()
    return menus
  }

  public async deleteMenu(menuValue: string) {
    const menu = await this.$posts.get('menus').remove({ name: menuValue }).write()
    return menu
  }
}
