import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useStorage } from "@plasmohq/storage/hook";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { PiClockCountdownBold } from "react-icons/pi";
import { MdOutlineAccessAlarms } from "react-icons/md";

import { Badge } from "~components/ui/badge";
import { Button } from "~components/ui/button";

import { defaultValueFunction, storageConfig, useCurrentIdStore, usePageVisibleStore, useVersionStore } from "~store";
import { Switch } from "~components/ui/switch";



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

  const handleRemoved = () => {
    setOpenPage('removedList')
  }

  const onCheckedChange = (id: string, checked: boolean) => {
    setRules(rules.map(rule => {
      if (rule.id === id) {
        return {
          ...rule,
          switchOn: checked
        }
      }
      return rule
    }))
  }

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="flex justify-start items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleAdd}>
            <IoMdAdd className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleCountdown}>
            <MdOutlineAccessAlarms className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRemoved}>
            <PiClockCountdownBold className="h-5 w-5" />
          </Button>
        </div>
        <Badge variant="outline"> v {version}</Badge>
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
            <TableRow key={rule.id} className={`${!rule.switchOn && "opacity-50"}`}  >
              <TableCell className={`font-medium`}>{rule.title}</TableCell>
              <TableCell>{rule.time.toString() + " " + rule.unit}</TableCell>
              <TableCell>
                <Switch
                  checked={rule.switchOn}
                  onCheckedChange={() => onCheckedChange(rule.id, !rule.switchOn)}
                /></TableCell>
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
