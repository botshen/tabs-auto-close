import { RuleFormPage } from "~rule-form";
import RuleTable from "~rule-table";
import { usePageVisibleStore } from "~store";
import "./style.css";
import CountdownPage from "~rule-countdown";
import RuleRemovedPage from "~rule-removed";

function IndexPopup() {
  const { openPage } = usePageVisibleStore()
  return (
    <div className="min-w-[422px] h-[600px] p-4 ">
      {
        openPage === "ruleList" && <RuleTable />
      }
      {
        openPage === "ruleForm" && <RuleFormPage />
      }
      {
        openPage === "countdownList" && <CountdownPage />
      }
      {
        openPage === "removedList" && <RuleRemovedPage />
      }
    </div>
  );
};

export default IndexPopup
