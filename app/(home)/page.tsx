import HomeCarousel from "@/components/shared/home/home-carousel";
import data from "@/lib/data";

const Page = async () => {
  console.log(data.carousels);
  return (
    <>
      <HomeCarousel items={data.carousels} />
    </>
  );
};

export default Page;
