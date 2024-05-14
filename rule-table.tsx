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
import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { GrClear } from "react-icons/gr";

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
  const handleClearAlarms = async () => {
    await chrome.alarms.clearAll();
    await fetchAlarms()
  }
  // 添加一个状态来存储alarms信息
  const [alarms, setAlarms] = useState([]);
  const fetchAlarms = async () => {
    const alarms = await chrome.alarms.getAll();
    console.log('alarms', alarms)
    setAlarms(alarms); // 更新状态以存储alarms信息
  };
  useEffect(() => {
    // 当组件挂载时获取所有alarms
    fetchAlarms();
  }, []); // 空依赖数组意味着这个effect仅在组件挂载时运行

  // 将Unix时间戳转换为更易读的格式（时分秒）
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // 24小时制
    }).format(date);
  };

  return (
    <>
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleAdd}>
        <IoMdAdd className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="mb-2" onClick={handleClearAlarms}>
        <GrClear className="h-5 w-5" />
      </Button>
      <div>
        {alarms.map((alarm, index) => (
          <div key={index} className="p-2 m-2 border rounded shadow">
            <div>{`Alarm Name: ${alarm.name}`}</div>
            <div>{`Scheduled Time: ${formatTime(alarm.scheduledTime)}`}</div>
          </div>
        ))}
      </div>
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
