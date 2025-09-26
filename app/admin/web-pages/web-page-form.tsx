/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
import "react-markdown-editor-lite/lib/index.css";
import { z } from "zod";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

const webPageDefaultValues =
  process.env.NODE_ENV === "development"
    ? {
        title: "Sample Page",
        slug: "sample-page",
        content: "Sample Content",
        isPublished: false,
      }
    : { title: "", slug: "", content: "", isPublished: false };

export const WebPageForm = ({
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
  } as any);

  async function onSubmit(values: z.infer<typeof WebPageInputSchema>) {
    if (type === "Create") {
      const res = await createWebPage(values);
      if (!res.success) return toast.error(res.message);
      toast.success(res.message);
      router.push("/admin/web-pages");
    }

    if (type === "Update") {
      if (!webPageId) return router.push("/admin/web-pages");
      const res = await updateWebPage({ ...values, _id: webPageId });
      if (!res.success) return toast.error(res.message);
      toast.success(res.message);
      router.push("/admin/web-pages");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title & Slug */}
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
                    <Input
                      placeholder="Enter slug"
                      className="pl-8"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        form.setValue("slug", toSlug(form.getValues("title")))
                      }
                      className="absolute right-2 top-2.5"
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
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <MdEditor
                    {...field}
                    style={{ height: "500px" }}
                    renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                    onChange={({ text }) => form.setValue("content", text)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Published */}
        <div>
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="space-x-2 items-center">
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
        </div>

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
