import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEffect, useState } from "react";
import { GrClear } from "react-icons/gr";
import { IoArrowBackCircleOutline } from "react-icons/io5";

import { Button } from "~components/ui/button";
import { formatTime } from "~lib/utils";
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



  return (
    <>
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleBack}>
        <IoArrowBackCircleOutline className="h-5 w-5" />
      </Button>
      <Button variant="outline" size="icon" className="mb-2 mr-2" onClick={handleClearAlarms}>
        <GrClear className="h-5 w-5" />
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tab URL</TableHead>
            <TableHead className="text-right">Scheduled Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alarms.length > 0 && alarms.map(({ alarm, tab }, index) => (
            <TableRow key={alarm.id || index}>
              <TableCell>
                <div className="flex items-center gap-1">
                  {tab.favIconUrl ? <img className="w-4 h-4" src={tab.favIconUrl} /> : null}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate max-w-[190px] cursor-pointer">{tab.title}</span>
                      </TooltipTrigger>
                      <TooltipContent >
                        <p className="break-words max-w-[190px]">{tab.url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell className="w-[166px] font-medium text-right">
                {formatTime(alarm.scheduledTime)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>

  )
}

export default CountdownPage
