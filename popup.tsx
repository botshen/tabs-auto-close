import { RuleFormPage } from "~rule-form";
import RuleTable from "~rule-table";
import { useFormVisibleStore } from "~store";
import "./style.css";

function IndexPopup() { 
  const { isOpen } = useFormVisibleStore() 
  return (
    <div className="w-[370px] h-[435px] p-4 ">
      {
        isOpen ?
          <RuleFormPage /> :
          <RuleTable />
      }
    </div>
  );
};

export default IndexPopup
