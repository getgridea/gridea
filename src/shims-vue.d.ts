declare module '*.vue' {
  import { ComponentOptions } from 'vue'

  export default Vue
}
declare module '*.json' {
  const data: any
  export default data
}

declare module 'vue2-transitions'
declare module '@iktakahiro/markdown-it-katex'
declare module 'markdown-it-toc-and-anchor'
declare module 'markdown-it-task-lists'
declare module 'markdown-it-abbr'
declare module 'markdown-it-footnote'
declare module 'markdown-it-mark'
declare module 'markdown-it-sub'
declare module 'markdown-it-sup'
declare module 'markdown-it-imsize'
declare module 'markdown-it-emoji'
declare module 'markdown-it-implicit-figures'
declare module 'markdown-it-image-lazy-loading'
declare module 'electron-google-analytics'
declare module 'macaddress'
declare module 'v-emoji-picker'
declare module 'vue-shortkey'

declare module 'easy-ftp'
declare module 'node-ssh'

declare module 'vuedraggable' {
  

  export interface DraggedContext<T> {
    index: number;
    futureIndex: number;
    element: T;
  }

  export interface DropContext<T> {
    index: number;
    component: Vue;
    element: T;
  }

  export interface Rectangle {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  }

  export interface MoveEvent<T> {
    originalEvent: DragEvent;
    dragged: Element;
    draggedContext: DraggedContext<T>;
    draggedRect: Rectangle;
    related: Element;
    relatedContext: DropContext<T>;
    relatedRect: Rectangle;
    from: Element;
    to: Element;
    willInsertAfter: boolean;
    isTrusted: boolean;
  }

  const draggableComponent: ComponentOptions<Vue>

  export default draggableComponent
}
