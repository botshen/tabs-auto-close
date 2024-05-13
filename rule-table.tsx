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
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

import { Button } from "~components/ui/button"
import { useFormVisibleStore } from "~store";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

const RuleTable = () => {
  const { setIsOpen } = useFormVisibleStore()

  const handleEdit = () => {
    console.log("edit")
    setIsOpen(true)
  }

  const handleRemove = () => {
    console.log("delete")
  }
  const handleAdd = () => {
    console.log("add")
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
            <TableHead>Close Timeout</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody >
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell className="text-right flex items-center justify-end gap-3">
                <CiEdit className="h-5 w-5" onClick={handleEdit} />
                <MdDeleteForever className="h-5 w-5" onClick={handleRemove} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </>

  )
}

export default RuleTable
