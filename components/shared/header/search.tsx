import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

import { getAllCategories } from "@/lib/actions/product.actions";

import { getSetting } from "@/lib/actions/setting.actions";
import { getTranslations } from "next-intl/server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default async function Search() {
  const categories = await getAllCategories();
  const {
    site: { name },
  } = await getSetting();
  const t = await getTranslations();

  return (
    <form action="/search" method="GET" className="flex items-stretch h-10">
      <Select name="category">
        <SelectTrigger className="!h-10 w-auto flex items-center dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none">
          <SelectValue placeholder={t("Header.All")} />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-60">
          <SelectItem value="all">{t("Header.All")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className="flex-1 !h-10 rounded-none dark:border-gray-200 bg-gray-100 text-black text-base"
        placeholder={t("Header.Search Site", { name })}
        name="q"
        type="search"
      />

      <button
        type="submit"
        className="bg-primary text-primary-foreground rounded-s-none rounded-e-md !h-10 px-3 py-2"
      >
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  );
}
