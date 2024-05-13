
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useStorage } from "@plasmohq/storage/hook"
import { nanoid } from 'nanoid'
import { useEffect } from "react"
import { defaultValueFunction, storageConfig, useCurrentIdStore, useFormVisibleStore } from "~store"


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
  const { id } = useCurrentIdStore()
  const [rules, setRules] = useStorage<RuleType[]>(storageConfig, defaultValueFunction)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      time: "",
      match: ""
    },
  })
  useEffect(() => {
    const currentRule = rules.find(item => item.id === id);
    if (currentRule) {
      form.reset({
        title: currentRule.title,
        time: currentRule.time,
        match: currentRule.match,
      });
    }
  }, [rules]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (id) {
      setRules(rules.map(item => item.id === id ? {
        id: id,
        title: data.title,
        time: data.time,
        match: data.match,
        updatedAt: new Date().toISOString(),
        createdAt: item.createdAt,
      } : item))
    } else {
      setRules([{
        id: nanoid(18),
        title: data.title,
        time: data.time,
        match: data.match,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, ...rules]);
    }

    setIsOpen(false)
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
