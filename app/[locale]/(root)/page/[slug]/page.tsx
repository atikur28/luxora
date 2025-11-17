import { getWebPageBySlug } from "@/lib/actions/web-page.actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { slug } = params;

  const webPage = await getWebPageBySlug(slug);
  if (!webPage) {
    return { title: "Web page not found" };
  }
  return {
    title: webPage.title,
  };
}

export default async function ProductDetailsPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page: string; color: string; size: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const webPage = await getWebPageBySlug(slug);

  if (!webPage) notFound();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="h1-bold py-4">{webPage.title}</h1>
      <section className="text-justify text-lg mb-20 web-page-content">
        <ReactMarkdown>{webPage.content}</ReactMarkdown>
      </section>

      <div className="mt-6 flex justify-center">
        <Link
          href="/account"
          className="inline-block bg-[#5A3DF0] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#4A2DD8] transition-all"
        >
          Create Your Account & Become an Affiliate
        </Link>
      </div>
    </div>
  );
}
