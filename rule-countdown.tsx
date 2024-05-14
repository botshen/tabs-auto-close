import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { GrClear } from "react-icons/gr";
import { IoArrowBackCircleOutline } from "react-icons/io5";

import { Button } from "~components/ui/button";
import { usePageVisibleStore } from "~store";



const CountdownPage = () => {
  const { setOpenPage } = usePageVisibleStore()

  const handleClearAlarms = async () => {
    await chrome.alarms.clearAll();
    await fetchAlarms()
  }
  const handleBack = () => {
    setOpenPage("ruleList")
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
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleBack}>
        <IoArrowBackCircleOutline className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleClearAlarms}>
        <GrClear className="h-5 w-5" />
      </Button>
      <Table >
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Alarm Name</TableHead>
            <TableHead className="text-right">Scheduled Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {alarms.map((alarm) => (
            <TableRow key={alarm.id}>
              <TableCell className="font-medium">{alarm.name}</TableCell>
              <TableCell className="font-medium text-right">{formatTime(alarm.scheduledTime)}</TableCell>  
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </>

  )
}

export default CountdownPage
