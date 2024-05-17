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
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { PiClockCountdownBold } from "react-icons/pi";

import { Button } from "~components/ui/button";
import { Badge } from "~components/ui/badge";

import { defaultValueFunction, storageConfig, useCurrentIdStore, usePageVisibleStore, useVersionStore } from "~store";



const RuleTable = () => {
  const { version } = useVersionStore()
  const { setOpenPage } = usePageVisibleStore()
  const [rules, setRules] = useStorage<RuleType[]>(storageConfig, defaultValueFunction)
  const { setId } = useCurrentIdStore()
  const handleEdit = (id: string) => {
    setId(id)
    setOpenPage('ruleForm')
  }
  const handleRemove = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
  }
  const handleAdd = () => {
    setId("")
    setOpenPage('ruleForm')
  }
  const handleCountdown = () => {
    setOpenPage('countdownList')
  }

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleAdd}>
            <IoMdAdd className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCountdown}>
            <PiClockCountdownBold className="h-5 w-5" />
          </Button>
        </div>
        <Badge variant="outline">v {version}</Badge>
      </div>

      <Table >
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Timeout</TableHead>
            <TableHead>SwitchOn</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {rules.map((rule) => (
            <TableRow key={rule.id} >
              <TableCell className="font-medium">{rule.title}</TableCell>
              <TableCell>{rule.time.toString() + " " + rule.unit}</TableCell>
              <TableCell>{rule.switchOn ? <Badge variant="default">On</Badge> : <Badge variant="destructive">Off</Badge>}</TableCell>
              <TableCell className="text-right flex items-center justify-end gap-3">
                <CiEdit className="h-5 w-5" onClick={() => handleEdit(rule.id)} />
                <MdDeleteForever className="h-5 w-5" onClick={() => handleRemove(rule.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </>

  )
}

export default RuleTable
