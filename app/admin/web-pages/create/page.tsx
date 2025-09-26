import WebPageForm from "../web-page-form";

export default function CreateWebPagePage() {
  return (
    <div>
      <h1 className="h1-bold">Create WebPage</h1>
      <div className="my-8">
        <WebPageForm type="Create" />
      </div>
    </div>
  );
}
