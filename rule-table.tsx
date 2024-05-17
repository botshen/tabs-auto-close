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

import { defaultValueFunction, storageConfig, useCurrentIdStore, usePageVisibleStore } from "~store";



const RuleTable = () => {
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
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleAdd}>
        <IoMdAdd className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="mb-2" onClick={handleCountdown}>
        <PiClockCountdownBold className="h-5 w-5" />
      </Button>

      <Table >
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Title</TableHead>
            <TableHead>Timeout</TableHead>
            <TableHead>SwitchOn</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {rules.map((rule) => (
            <TableRow key={rule.id}>
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
