 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useFormVisibleStore } from "~store"
import { nanoid } from 'nanoid'


const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }),
  time: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }),
  match: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }),
})

export function RuleFormPage() {
  const { setIsOpen } = useFormVisibleStore()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      time:"",
      match:""
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log('data',data)
    console.log('nanoid()',nanoid(18))
  }
  const handleCancel = () => {
    setIsOpen(false)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-3">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Close Timeout</FormLabel>
              <FormControl>
                <Input placeholder="Close Timeout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="match"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Match</FormLabel>
              <FormControl>
                <Input placeholder="Match" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" className="mr-2">Submit</Button>
        <Button variant="secondary" size="sm" onClick={handleCancel}>Cancel</Button>
      </form>
    </Form>
  )
}
