import { Storage } from "@plasmohq/storage"
import { AUTO_CLOSE_TAB_RULES } from "~const"
import { create } from 'zustand'


export const storageConfig = {
  key: AUTO_CLOSE_TAB_RULES,
  instance: new Storage({
    area: "local",
    copiedKeyList: [AUTO_CLOSE_TAB_RULES]
  })
}
 

interface Type {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const useFormVisibleStore = create<Type>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen:boolean) => set({ isOpen }),
}))
