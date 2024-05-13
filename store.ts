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


interface OpenType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

interface IdType {
  id: string
  setId: (id: string) => void
}
export const useFormVisibleStore = create<OpenType>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}))

export const useCurrentIdStore = create<IdType>((set) => ({
  id: "",
  setId: (id: string) => set({ id }),
}))


export const defaultValueFunction = (v: RuleType[]) => v ?? []
