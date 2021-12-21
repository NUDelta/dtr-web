import React from "react";

export default function HomeIntro(): JSX.Element {
  return (
    <div>
      <div className="prose">
        <h2 className="">Design, Technology, and Research (DTR)</h2>

        <p>
          At DTR, we develop systems that shape new experiences with people and
          technology. We are designers, builders, and researchers. We are
          undergrads, grads, and faculty. We are a community who support one
          another, work hard together, learn together, laugh together, have a
          good time together, struggle together. We design solutions to address
          people’s needs, explore new technologies that capture our imagination,
          and challenge ourselves to advance the state of the art through
          research.
        </p>

        <p className="text-xs">
          DTR projects are made possible through generously support from
          National Science Foundation grants in{" "}
          <a href="http://www.nsf.gov/awardsearch/showAward?AWD_ID=1618096">
            Cyber-Human Systems
          </a>
          ,{" "}
          <a href="http://www.nsf.gov/awardsearch/showAward?AWD_ID=1623635">
            Cyberlearning
          </a>
          , and{" "}
          <a href="http://www.nsf.gov/awardsearch/showAward?AWD_ID=1464315">
            the Research Initiation Initiative
          </a>
          ; a{" "}
          <a href="http://fuse.microsoft.com/research/award">
            Microsoft FUSE Labs Research Award
          </a>
          ; Northwestern’s{" "}
          <a href="http://www.mccormick.northwestern.edu/alumni/murphy-society-awards/">
            Murphy Society Grant
          </a>
          ; and Northwestern’s{" "}
          <a href="http://www.northwestern.edu/provost/faculty-honors/digital-learning-fellowships/index.html">
            Office of the Provost Award for Digital Learning
          </a>
          .
        </p>
      </div>
    </div>
  );
}
