import { useStorage } from "@plasmohq/storage/hook";
import { useState } from "react";
import { RuleFormPage } from "~rule-form";
import RuleTable from "~rule-table";
import { storageConfig, useFormVisibleStore } from "~store";
import "./style.css";

function IndexPopup() {

  const [rules, setRules] = useStorage(storageConfig)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };
  const { isOpen } = useFormVisibleStore()

  return (
    <div className="w-[400px] h-[400px] p-4 ">
      {
        isOpen ?
          <RuleFormPage /> :
          <RuleTable />
      }
    </div>
  );
};

export default IndexPopup
