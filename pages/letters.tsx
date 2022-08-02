import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import Link from "next/link";
import * as url from "url";

export default function Letters(): JSX.Element {
    return (
        <div>
            <Header />

            <Container className="mt-8">
                <div className="prose max-w-4xl mx-auto">
                    <h1 className="font-semibold text-3xl">
                        DTR Annual Letters
                    </h1>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vel aliquam est. Vivamus id auctor turpis, ac rhoncus purus. Quisque est mi, lacinia sit amet interdum nec, bibendum eget lectus. Cras nisi nunc, ornare non nisl ut, gravida tempus dolor. Morbi vitae elit faucibus, mollis mauris eget, luctus mi. Suspendisse porttitor et lacus sed pharetra. Integer efficitur sapien lacus, varius efficitur nibh gravida a.

                    {/* Annual Letters Placeholder */}
                    <h2>Annual Letters</h2>
                    <div className="space-y-6">
                        {annualLetters.map((annualLetter, i) => (
                            <div key={i} className="mb-4">
                                <h3>
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={ annualLetter.link }
                                    >
                                        { annualLetter.name }
                                    </a>
                                </h3>
                                <h4 className="italic">
                                    { annualLetter.datePublished.toLocaleString("en-us", {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) }
                                </h4>
                                <p>
                                    { annualLetter.description }
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}

type AnnualLetter = {
    name: string,
    datePublished: Date,
    description: string,
    link: string,
};

const annualLetters: AnnualLetter[] = [
    {
        name: "Annual Letter 2022",
        datePublished: new Date(2022, 8 - 1, 1),
        description: "Praesent vitae neque lacus. Donec magna ligula, lobortis eu pellentesque sit amet, imperdiet sed turpis. Phasellus mauris sem, aliquet vitae pulvinar a, dictum in diam. Nunc a iaculis risus, vitae porttitor erat. Pellentesque eget placerat nulla, volutpat rhoncus mi. Quisque at lorem odio. Nulla eu molestie sem. Morbi cursus enim et odio malesuada, non tempus velit finibus.",
        link: "http://users.eecs.northwestern.edu/~hq/",
    },
    {
        name: "Annual Letter 2021",
        datePublished: new Date(2021, 8 - 1, 1),
        description: "Morbi varius diam id ex hendrerit bibendum. Nullam iaculis ultrices condimentum. Praesent scelerisque odio in eros mattis, sit amet posuere libero finibus. In vel ligula orci. Vestibulum aliquam ornare cursus. Etiam sollicitudin purus sit amet dapibus malesuada. In posuere mauris justo, non facilisis magna facilisis id. Nullam a varius urna. Nunc pellentesque eleifend eros eget egestas.",
        link: "http://users.eecs.northwestern.edu/~hq/",
    }
];