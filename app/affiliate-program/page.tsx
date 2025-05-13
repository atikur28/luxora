import Image from "next/image";
import Link from "next/link";
import office from "./office.png";

// Icons from lucide-react (shadcn UI)
import { UserPlus, ThumbsUp, DollarSign, Quote } from "lucide-react";

export default function AffiliateLanding() {
  return (
    <div className="font-sans text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <Link href="/">
          <div className="text-2xl font-bold border-2 border-white rounded-md hover:border-black md:px-1 md:py-1">
            <span className="text-black">Luxora </span>
            <span className="text-orange-500">ssociates</span>
          </div>
        </Link>
        <div className="flex gap-6">
          <Link href="sign-in" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <Image
          src={office}
          alt="Office Background"
          fill
          priority
          className="object-cover"
        />
        <div className="relative bg-black/50 text-white p-8 rounded-md text-center z-10">
          <h1 className="text-3xl font-semibold mb-4">
            Recommend Products. Earn Commissions.
          </h1>
          <Link
            href="sign-up"
            className="bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition px-4 py-2 rounded-lg"
          >
            Sign up
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Luxora Associates – Luxora’s affiliate marketing program
        </h2>
        <p className="text-base leading-relaxed text-gray-700 mb-12">
          Welcome to one of the largest affiliate marketing programs in the
          world. The Luxora Associates Program helps content creators,
          publishers, and bloggers monetize their traffic.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 border rounded-lg hover:shadow-lg transition">
            <UserPlus className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Sign up</h3>
            <p className="text-gray-600">
              Join tens of thousands of creators, publishers, and bloggers who
              are earning with the Luxora Associates Program.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition">
            <ThumbsUp className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Recommend</h3>
            <p className="text-gray-600">
              Share millions of products with your audience. We have customized
              linking tools for large publishers, bloggers, and influencers.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition">
            <DollarSign className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Earn</h3>
            <p className="text-gray-600">
              Earn up to 10% in commissions from qualifying purchases and
              programs. Our competitive conversion rates help maximize your
              earnings.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-12">
            What Our Partners Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {[
              {
                quote:
                  "Luxora Associates has been a critical driver of our commerce initiatives and has enabled us to build a business that first and foremost services our audience.",
                name: "BuzzFeed",
              },
              {
                quote:
                  "We're able to find all of the products on Luxora that we want to recommend to our audience. We value being able to help our audience find and purchase what they need.",
                name: "Fire Food Chef",
              },
              {
                quote:
                  "Since we have a global audience, the Associates Program has helped us to scale our earnings internationally. It's been simple to sign up, expand, and use!",
                name: "Impremedia",
              },
              {
                quote:
                  "The Associates Program has given us all of the tools and data that we need to quickly make content decisions and continually grow our earnings.",
                name: "Domino",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded shadow hover:shadow-md transition"
              >
                <Quote className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-gray-700 mb-4">
                  &quot;{testimonial.quote}&quot;
                </p>
                <p className="font-semibold text-orange-500">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
        <p>© 2025 Luxora, Inc.</p>
      </footer>
    </div>
  );
}
