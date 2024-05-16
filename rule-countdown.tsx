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
    let alarmsData = await chrome.alarms.getAll();
    let alarmsWithTabs = [];

    for (let alarm of alarmsData) {
      let tabId = parseInt(alarm.name);
      try {
        let tab = await new Promise((resolve, reject) => {
          chrome.tabs.get(tabId, (tabInfo) => {
            resolve(tabInfo);
          });
        });

        if (tab) {
          alarmsWithTabs.push({
            alarm: alarm,
            tab: tab // 添加tab信息到alarms数组中
          })
        }
      } catch (error) {
        console.log(error);
      }
    }

    setAlarms(alarmsWithTabs);
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24-hour format
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
            <TableHead>Tab URL</TableHead>
            <TableHead className="text-right">Scheduled Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {alarms.length > 0 && alarms.map(({ alarm, tab }, index) => (
            <TableRow key={alarm.id || index}>  
              <TableCell title={tab.url}>
                <div className="truncate max-w-[150px] cursor-pointer">{tab.url}</div>
              </TableCell>
              <TableCell className="font-medium text-right">{formatTime(alarm.scheduledTime)}</TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </>

  )
}

export default CountdownPage
