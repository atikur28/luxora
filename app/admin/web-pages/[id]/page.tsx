import { getWebPageById } from "@/lib/actions/web-page.actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import WebPageForm from "../web-page-form";

const UpdateWebPage = async ({ params }: { params: { id: string } }) => {
  const webPage = await getWebPageById(params.id);
  if (!webPage) notFound();

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/web-pages">Web Pages</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/web-pages/${webPage._id}`}>{webPage._id}</Link>
      </div>

      <div className="my-8">
        <WebPageForm type="Update" webPage={webPage} webPageId={webPage._id} />
      </div>
    </main>
  );
};

export default UpdateWebPage;
