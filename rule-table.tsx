import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useStorage } from "@plasmohq/storage/hook";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

import { Button } from "~components/ui/button"
import { defaultValueFunction, storageConfig, useCurrentIdStore, useFormVisibleStore } from "~store";



const RuleTable = () => {
  const { setIsOpen } = useFormVisibleStore()
  const [rules, setRules] = useStorage<RuleType[]>(storageConfig, defaultValueFunction)

  const { setId } = useCurrentIdStore()


  const handleEdit = (id: string) => {
    setId(id)
    setIsOpen(true)
  }

  const handleRemove = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
  }
  const handleAdd = () => {
    setId("")
    setIsOpen(true)
  }
  return (
    <>
      <Button variant="outline" size="icon" className="mb-2" onClick={handleAdd}>
        <IoMdAdd className="h-5 w-5" />
      </Button>
      <Table >
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Title</TableHead>
            <TableHead>Close Timeout (min)</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">{rule.title}</TableCell>
              <TableCell>{(Number(rule.time) / 60000).toString()}</TableCell>
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
