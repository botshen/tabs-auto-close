import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { GrClear } from "react-icons/gr";
import { IoArrowBackCircleOutline } from "react-icons/io5";

import { Button } from "~components/ui/button";
import { formatTime } from "~lib/utils";
import { defaultValueFunction, storageHistoryConfig, usePageVisibleStore } from "~store";



const RuleRemovedPage = () => {
  const { setOpenPage } = usePageVisibleStore()
  const [rules, setRules] = useStorage<HistoryRuleType[]>(storageHistoryConfig, [])


  const handleBack = () => {
    setOpenPage("ruleList")
  }

  const handleOpenUrl = async (url: string) => {
    setRules(() => rules.filter(r => r.url !== url))
    await chrome.tabs.create({ url });
  }




  return (
    <>
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleBack}>
        <IoArrowBackCircleOutline className="h-5 w-5" />
      </Button>

      <Table >
        <TableHeader>
          <TableRow>
            <TableHead>Tab Title</TableHead>
            <TableHead className="text-right">Close Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {rules.length > 0 && rules.map((rule, index) => (
            <TableRow key={rule.id || index}>
              <TableCell title={rule.url}>
                <div className="flex items-center gap-1">
                  {rule.icon ? <img className="w-4 h-4 inline-block" src={rule.icon} /> : ""}
                  <div className="text-[#234da7] truncate cursor-pointer  max-w-[190px] " onClick={() => handleOpenUrl(rule.url)}>  {rule.title}</div>
                </div>
              </TableCell>
              <TableCell className="w-[166px] font-medium text-right">{formatTime(rule.closeTime)}</TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </>

  )
}

export default RuleRemovedPage
