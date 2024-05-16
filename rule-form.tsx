
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { RxLetterCaseCapitalize } from "react-icons/rx";
import { RxLetterSpacing } from "react-icons/rx";
import { TbIrregularPolyhedron } from "react-icons/tb";


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useStorage } from "@plasmohq/storage/hook"
import { nanoid } from 'nanoid'
import { useEffect } from "react"
import { defaultValueFunction, storageConfig, useCurrentIdStore, usePageVisibleStore } from "~store"
import { Checkbox } from "~components/ui/checkbox"

const items = [
  {
    label: "Match Case",
    icon: <RxLetterCaseCapitalize />,
    code: "case",
  },
  {
    label: "Match WholeWord",
    icon: <RxLetterSpacing />,
    code: "wholeWord",
  },
  {
    label: "Use Regular Expression",
    icon: <TbIrregularPolyhedron />,
    code: "regular"
  }
] as const

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }),
  time: z.string().min(1, {
    message: "time must be at least 1 characters.",
  }),
  match: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }),
  matchType: z.array(z.string()).optional(),
  //单位，一个选择器选择分钟，小时，天,选择的是个字符串
  unit: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }),
})

export function RuleFormPage() {
  const { setOpenPage } = usePageVisibleStore()
  const { id } = useCurrentIdStore()
  const [rules, setRules] = useStorage<RuleType[]>(storageConfig, defaultValueFunction)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      time: "",
      match: "",
      matchType: [],
      unit: 'min'
    },
  })

  useEffect(() => {
    const currentRule = rules.find(item => item.id === id);
    if (currentRule) {
      form.reset({
        title: currentRule.title,
        time: currentRule.time.toString(),
        match: currentRule.match,
        matchType: currentRule.matchType,
        unit: currentRule.unit
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
        matchType: data.matchType,
        unit: data.unit,
        updatedAt: new Date().toISOString(),
        createdAt: item.createdAt,
      } : item))
    } else {
      setRules([{
        id: nanoid(18),
        title: data.title,
        time: data.time,
        match: data.match,
        unit: data.unit,
        matchType: data.matchType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, ...rules]);
    }

    setOpenPage('ruleList')
  }
  const handleCancel = () => {
    setOpenPage("ruleList")
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2">
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
          name="unit"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="min">min</SelectItem>
                  <SelectItem value="hour">hour</SelectItem>
                  <SelectItem value="day">day</SelectItem>
                  {/* <SelectItem value="week">week</SelectItem>
                  <SelectItem value="month">month</SelectItem>
                  <SelectItem value="year">year</SelectItem>   */}
                </SelectContent>
              </Select>
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
        <FormField
          control={form.control}
          name="matchType"
          render={() => (
            <FormItem>
              {items.map((item) => (
                <FormField
                  key={item.code}
                  control={form.control}
                  name="matchType"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.code}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.code)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.code])
                                : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.code
                                  )
                                )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal flex items-center gap-4">
                          {item.icon}{item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
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
