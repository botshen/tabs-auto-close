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
  openPage: string
  setOpenPage: (openPage: string) => void
}

interface IdType {
  id: string
  setId: (id: string) => void
}
export const usePageVisibleStore = create<OpenType>((set) => ({
  openPage: 'countdownList',
  setOpenPage: (openPage: string) => set({ openPage }),
}))

export const useCurrentIdStore = create<IdType>((set) => ({
  id: "",
  setId: (id: string) => set({ id }),
}))


export const defaultValueFunction = (v: RuleType[]) => v ?? []
