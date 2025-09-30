"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useSetting from "@/hooks/use-setting-store";
import { updateSetting } from "@/lib/actions/setting.actions";
import { SettingInputSchema } from "@/lib/validator";
import { ClientSetting, ISettingInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import CarouselForm from "./carousel-form";
import CommonForm from "./common-form";
import CurrencyForm from "./currency-form";
import DeliveryDateForm from "./delivery-date-form";
import LanguageForm from "./language-form";
import PaymentMethodForm from "./payment-method-form";
import SiteInfoForm from "./site-info-form";

const SettingForm = ({ setting }: { setting: ISettingInput }) => {
  const { setSetting } = useSetting();

  const form = useForm<ISettingInput>({
    resolver: zodResolver(SettingInputSchema) as Resolver<ISettingInput>,
    defaultValues: setting,
  });
  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: ISettingInput) {
    const res = await updateSetting({ ...values });
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      setSetting(values as ClientSetting);
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SiteInfoForm id="setting-site-info" form={form} />
        <CommonForm id="setting-common" form={form} />
        <CarouselForm id="setting-carousels" form={form} />

        <LanguageForm id="setting-languages" form={form} />

        <CurrencyForm id="setting-currencies" form={form} />

        <PaymentMethodForm id="setting-payment-methods" form={form} />

        <DeliveryDateForm id="setting-delivery-dates" form={form} />

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full mb-24"
          >
            {isSubmitting ? "Submitting..." : `Save Setting`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SettingForm;
