import { Storage } from "@plasmohq/storage"
import { AUTO_CLOSE_TAB_RULES, AUTO_CLOSE_TAB_RULES_HISTORY } from "~const"
import { create } from 'zustand'


export const storageConfig = {
  key: AUTO_CLOSE_TAB_RULES,
  instance: new Storage({
    area: "local",
    copiedKeyList: [AUTO_CLOSE_TAB_RULES]
  })
}

export const storageHistoryConfig = {
  key: AUTO_CLOSE_TAB_RULES_HISTORY,
  instance: new Storage({
    area: "local",
    copiedKeyList: [AUTO_CLOSE_TAB_RULES_HISTORY]
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
  openPage: 'ruleList',
  setOpenPage: (openPage: string) => set({ openPage }),
}))

export const useCurrentIdStore = create<IdType>((set) => ({
  id: "",
  setId: (id: string) => set({ id }),
}))


export const defaultValueFunction = (v: RuleType[]) => v ?? []

export const useVersionStore = create(() => ({
  version: chrome.runtime.getManifest().version
}))

