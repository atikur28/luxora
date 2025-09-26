"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWebPage, updateWebPage } from "@/lib/actions/web-page.actions";
import { IWebPage } from "@/lib/db/models/web-page.model";
import { toSlug } from "@/lib/utils";
import { WebPageInputSchema, WebPageUpdateSchema } from "@/lib/validator";
import { toast } from "sonner"; // <-- Sonner toast

const webPageDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
        title: "Sample Page",
        slug: "sample-page",
        content: "Sample Content",
        isPublished: false,
      }
    : {
        title: "",
        slug: "",
        content: "",
        isPublished: false,
      };

const WebPageForm = ({
  type,
  webPage,
  webPageId,
}: {
  type: "Create" | "Update";
  webPage?: IWebPage;
  webPageId?: string;
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof WebPageInputSchema>>({
    resolver:
      type === "Update"
        ? zodResolver(WebPageUpdateSchema)
        : zodResolver(WebPageInputSchema),
    defaultValues:
      webPage && type === "Update" ? webPage : webPageDefaultValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  async function onSubmit(values: z.infer<typeof WebPageInputSchema>) {
    if (type === "Create") {
      const res = await createWebPage(values);
      if (!res.success) {
        toast.error(res.message); // <-- show error
      } else {
        toast.success(res.message); // <-- show success
        router.push("/admin/web-pages");
      }
    } else if (type === "Update") {
      if (!webPageId) {
        router.push("/admin/web-pages");
        return;
      }
      const res = await updateWebPage({ ...values, _id: webPageId });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message); // <-- show success for update too
        router.push("/admin/web-pages");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title and Slug */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <button
                      type="button"
                      className="absolute right-2 top-2.5"
                      onClick={() =>
                        form.setValue("slug", toSlug(form.getValues("title")))
                      }
                    >
                      Generate
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <textarea
                  className="w-full p-3 border rounded-md h-[300px] resize-none"
                  placeholder="Enter content in markdown"
                  {...field}
                />
              </FormControl>
              <FormMessage />

              {/* Markdown Preview */}
              <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold mb-2">Preview</h3>
                <ReactMarkdown>{field.value}</ReactMarkdown>
              </div>
            </FormItem>
          )}
        />

        {/* Is Published */}
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Is Published?</FormLabel>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : `${type} Page`}
        </Button>
      </form>
    </Form>
  );
};

export default WebPageForm;
