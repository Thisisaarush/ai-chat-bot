import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Textarea } from "@workspace/ui/components/textarea"
import { api } from "@workspace/backend/convex/_generated/api"
import { useMutation } from "convex/react"
import { Doc } from "@workspace/backend/convex/_generated/dataModel"

export const widgetSettingsSchema = z.object({
  greetMessage: z.string().min(1, "Greet message is required"),
  defaultSuggestions: z.object({
    suggestion1: z.string().optional(),
    suggestion2: z.string().optional(),
    suggestion3: z.string().optional(),
  }),
})

type WidgetSettings = Doc<"widgetSettings">
type FormSchema = z.infer<typeof widgetSettingsSchema>

interface CustomizationFormProps {
  initialData: WidgetSettings | null
}

export const CustomizationForm = ({ initialData }: CustomizationFormProps) => {
  const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert)

  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      greetMessage: initialData?.greetMessage || "Hi! How can I help you?",
      defaultSuggestions: {
        suggestion1: initialData?.defaultSuggestions.suggestion1 || "",
        suggestion2: initialData?.defaultSuggestions.suggestion2 || "",
        suggestion3: initialData?.defaultSuggestions.suggestion3 || "",
      },
    },
  })

  const onSubmit = async (values: FormSchema) => {
    try {
      await upsertWidgetSettings({
        greetMessage: values.greetMessage,
        defaultSuggestions: values.defaultSuggestions,
      })
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings. Please try again.")
      console.error("Error saving widget settings:", error)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>General Chat Settings</CardTitle>
              <CardDescription>
                Configure basic chat widget behaviour and messages
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="greetMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Greet Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Welcome message shown when chat opens"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be displayed when the chat widget is
                      opened.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <div className="mb-4 text-sm">
                  <h3>Default Suggestions</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Quick reply suggestions shown to customers to help guide the
                    conversation
                  </p>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="defaultSuggestions.suggestion1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggestion 1</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. How do i get started?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="defaultSuggestions.suggestion2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggestion 2</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. What features do you offer?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="defaultSuggestions.suggestion3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suggestion 3</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. How can I contact support?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
