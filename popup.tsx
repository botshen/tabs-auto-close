import { useStorage } from "@plasmohq/storage/hook";
import { useState } from "react";
import { RuleFormPage } from "~rule-form";
import RuleTable from "~rule-table";
import { storageConfig } from "~store";
import "./style.css";
 
function IndexPopup() {

  const [rules, setRules] = useStorage(storageConfig)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };
  const [formVisible, setFormVisible] = useState(false);
  return (
    <div className="w-[400px] h-[300px] p-4 ">
      {
        formVisible ?
          <RuleFormPage /> :
          <RuleTable setFormVisible={setFormVisible} />
      }
    </div>
  );
};

export default IndexPopup
