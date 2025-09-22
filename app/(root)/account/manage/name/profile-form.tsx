"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUserName } from "@/lib/actions/user.actions";
import { UserNameSchema } from "@/lib/validator";
import { toast } from "sonner";

export const ProfileForm = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const form = useForm<z.infer<typeof UserNameSchema>>({
    resolver: zodResolver(UserNameSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof UserNameSchema>) {
    const res = await updateUserName(values);

    if (!res.success) {
      return toast.error(res.message);
    }

    const { data, message } = res;
    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: data.name,
      },
    };

    await update(newSession);
    toast.success(message);
    router.push("/account/manage");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">New name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Name"
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};
