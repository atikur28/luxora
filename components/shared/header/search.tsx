import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME } from "@/lib/constants";

const categories = ["Men", "Women", "Kids", "Accessories"];

const Search = async () => {
  return (
    <form action="/search" method="GET" className="flex items-stretch h-10">
  <Select name="category">
    <SelectTrigger className="h-10 min-h-10 px-3 dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none flex items-center">
      <SelectValue placeholder="All" />
    </SelectTrigger>
    <SelectContent position="popper">
      <SelectItem value="all">All</SelectItem>
      {categories.map((category) => (
        <SelectItem key={category} value={category}>
          {category}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  <Input
    className="flex-1 h-10 px-3 rounded-none dark:border-gray-200 bg-gray-100 text-black text-base"
    placeholder={`Search site ${APP_NAME}`}
    name="q"
    type="search"
  />

  <button
    type="submit"
    className="bg-primary text-primary-foreground text-black rounded-s-none rounded-e-md h-10 px-3 py-2 flex items-center justify-center"
  >
    <SearchIcon className="w-6 h-6" />
  </button>
</form>

  );
};

export default Search;
