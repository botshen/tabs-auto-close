import { Storage } from "@plasmohq/storage"
import { AUTO_CLOSE_TAB_RULES } from "~const"

export const storageConfig = {
  key: AUTO_CLOSE_TAB_RULES,
  instance: new Storage({
    area: "local",
    copiedKeyList: [AUTO_CLOSE_TAB_RULES]
  })
}
