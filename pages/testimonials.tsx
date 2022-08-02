import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import Link from "next/link";

export default function Testimonials(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        <div className="prose max-w-4xl mx-auto">
            <h1 className="font-semibold text-3xl">
                What Students Get Out of DTR
            </h1>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vel aliquam est. Vivamus id auctor turpis, ac rhoncus purus. Quisque est mi, lacinia sit amet interdum nec, bibendum eget lectus. Cras nisi nunc, ornare non nisl ut, gravida tempus dolor. Morbi vitae elit faucibus, mollis mauris eget, luctus mi. Suspendisse porttitor et lacus sed pharetra. Integer efficitur sapien lacus, varius efficitur nibh gravida a.



            {/* Quote Placeholder */}
            <h2>Testimonials from Students</h2>
            <div className="space-y-6">
                {quotes.map((quote, i) => (
                    <div key={i} className="italic pl-10 pr-10 mb-4">
                        { quote.text }
                    </div>
                ))}
            </div>
        </div>
      </Container>
    </div>
  );
}

// TODO: consider moving this out into a separate component/import to have a better MVC design
type quote = {
    text: string;
};

const quotes: quote[] = [
    {
        text: "Curabitur imperdiet maximus fermentum. In hac habitasse platea dictumst. Nulla fringilla risus in lacus pulvinar, a pulvinar diam porta. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus nisi ex, tincidunt vel varius id, suscipit ac magna. Praesent risus quam, hendrerit et sem vitae, finibus vestibulum sapien. Phasellus a orci eget elit dignissim iaculis semper eget elit. Proin consequat mi a tellus aliquam, vel luctus purus commodo. Etiam ut lectus placerat, placerat nisi ac, tincidunt purus. Duis suscipit mollis magna at placerat. Etiam leo nulla, fringilla eget sapien quis, congue sodales lacus."
    },
    {
        text: "Maecenas non justo vitae metus tempus tempor vel ut ex. Quisque dui diam, fermentum non felis a, dignissim mollis ante. Donec facilisis quam ac sem tempus egestas. Quisque enim ante, sodales a elementum ac, tempus et sapien. Mauris a nulla varius, dapibus ex vel, faucibus lorem. Nullam pulvinar velit eu purus imperdiet, quis efficitur ligula laoreet. Curabitur pharetra, sem non placerat sollicitudin, ipsum ligula sagittis ex, rutrum porta dui neque a velit. Phasellus bibendum lorem elit, vitae posuere nibh pellentesque non. Fusce ligula lacus, accumsan ac nibh vulputate, volutpat tincidunt enim. Duis at lacus nec risus congue sagittis eu venenatis risus. Duis et facilisis massa. Donec elit nulla, volutpat euismod dui sit amet, luctus tincidunt dui. Aenean mollis diam eu erat gravida sagittis."
    },
    {
        text: "Integer aliquam sodales mi, sed sollicitudin arcu fermentum sed. Aenean magna neque, volutpat bibendum magna at, tempor feugiat dui. Aliquam ornare mi tortor, vitae ornare orci ultrices non. Quisque dignissim nibh ut mi posuere ornare. Sed accumsan ac augue id aliquet. Cras at nibh et libero viverra tincidunt eget ullamcorper sem. Vestibulum malesuada mattis neque, at pulvinar nunc rhoncus eget. Sed eu sapien dolor. Morbi scelerisque hendrerit neque vehicula consequat. Quisque varius volutpat mauris, et accumsan sem semper et. Donec est quam, condimentum eu eros sit amet, pretium mattis ex. Donec efficitur, magna sit amet pharetra convallis, turpis massa facilisis mauris, non volutpat metus diam at arcu. Cras vitae sollicitudin nibh. Nulla vel enim tristique, tincidunt diam cursus, iaculis nisi. Nulla sodales metus sit amet tempus maximus."
    },
    {
        text: "Morbi enim leo, rhoncus sit amet eros in, lobortis convallis dui. Fusce sed orci nec dolor tincidunt sollicitudin. Nulla eu odio et tellus blandit vulputate non non mauris. Aenean nisi ex, viverra a bibendum eu, pulvinar at velit. Nunc risus diam, laoreet nec sodales sit amet, pharetra a leo. Ut ac sem id velit rutrum varius. Duis ante ex, vehicula egestas dolor vitae, efficitur auctor felis."
    }
];