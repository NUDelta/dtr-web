import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

import image1 from "./assets/1.jpg";
import image2 from "./assets/2.jpg";
import image3 from "./assets/3.jpg";
import image4 from "./assets/4.jpg";
import image5 from "./assets/5.jpg";

export default function Slides(): JSX.Element {
  return (
    <div>
      <Carousel
        showThumbs={false}
        swipeable={true}
        autoPlay={true}
        showStatus={false}
        infiniteLoop={true}
      >
        <div>
          <Image src={image1} alt="image1" className="responsive" />
        </div>

        <div>
          <Image src={image2} alt="image1" className="responsive" />
        </div>

        <div>
          <Image src={image3} alt="image1" className="responsive" />
        </div>

        <div>
          <Image src={image4} alt="image1" className="responsive" />
        </div>

        <div>
          <Image src={image5} alt="image1" className="responsive" />
        </div>
      </Carousel>

      <p className="text-xs text-gray-500 mt-2">photo credit: matthew zhang</p>
    </div>
  );
}
