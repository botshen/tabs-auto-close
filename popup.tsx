import { RuleFormPage } from "~rule-form";
import RuleTable from "~rule-table";
import { usePageVisibleStore } from "~store";
import "./style.css";
import CountdownPage from "~rule-countdown";

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
    </div>
  );
};

export default IndexPopup
