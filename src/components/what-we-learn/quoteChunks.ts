interface QuoteTheme {
  descriptor: string
  quotes: Quote[]
}

interface Quote {
  text: string
}

const quoteChunks: QuoteTheme[] = [
  {
    descriptor:
      'Students shared that DTR helped them learn to approach and solve problems:',
    quotes: [
      {
        text: 'I think DTR was the purest form of learning I encountered at Northwestern. I learned new mindsets and approaches to problems I had never considered before the class.',
      },
      {
        text: 'From DTR, I have learned whole-brain engineering, CS, HCI skills like design arguments, agile work, time management, abductive reasoning, conceptual thinking, mindfulness, research literature analysis, metacognitive analysis, qualitative and quantitative study design, abstract thinking, concrete reasoning, design approaches, user empathy, help seeking, risk assessment, thoughtful writing, self-reflection, and process thinking. ',
      },
      {
        text: 'A lot of the students in DTR came in just looking to code and came out with a whole new approach to coding. We learned to not just build something and then find a problem that it resolves but instead to find real problems and figure out if we can come up with a solution. To truly understand who are the users, what are their issues, and what are the various solutions to their problem.',
      },
      {
        text: 'As a wide-eyed sophomore just trying to do as much coding as possible, DTR and more specifically Haoqi, pushed me to slow down, think about the “Why” and the hypothesis that I was trying to solve. Looking back on it, this may have been the most impactful point in both my career as a student, and career as an engineer. A lot of entrepreneurs and researchers just want to build things, but without asking the right questions first and slowing down, you could be working on things that aren’t useful at the end. ',
      },
      {
        text: 'DTR taught me how to pursue my goals, question every assumption, and work to find comprehensive solutions to novel problems. It also taught me to manage my  time, emotions, and workload.',
      },
    ],
  },
  {
    descriptor:
      'Students emphasized that the learning did not stop at picking up problem solving skills, but in their orientation towards learning:',
    quotes: [
      {
        text: 'DTR provided me an opportunity to not just develop my technical and research skills through the projects we worked on, but most critically the skills that have helped me be a successful thinker and learner well beyond the scope of the course.',
      },
      {
        text: 'DTR was the most important part of my CS education and I think what defines me as a CS student from Northwestern, instilling in me the mindset of being a life-long learner. Plenty of classes at Northwestern could’ve told me that, but none of them are designed in the way that DTR is that that skill becomes like a muscle that we are actively strengthening.',
      },
      {
        text: 'As a student, I have always been worried about getting things right, sometimes losing track of the learning itself. This has hindered me in classes before, when I focus more on studying to do well for an exam than studying to really understand the concepts. DTR has helped me break out of this mindset, by shifting my focus to the learning process itself and caring less about the outcome. That way, I build problem solving skills to better approach questions I don’t know in the future. It’s okay to struggle! This idea is something I have been uncomfortable with throughout my life - I think most students at Northwestern are uncomfortable with it. But DTR has given me the tools to face my struggles and to use them as learning opportunities. Anywhere I’m struggling is an opportunity to learn something, and instead of being afraid of it, I tackle it head on, starting by addressing the risks.',
      },
    ],
  },
  {
    descriptor: 'Students highlighted the value of being in community:',
    quotes: [
      {
        text: 'I cannot think of another place that emphasized a community of independent undergraduate researchers. The community aspect of DTR not only facilitates better research by giving access others’ knowledge in seeking help, it also is incredibly motivating— to see your classmates succeed, to have them encourage you into your own successes.',
      },
      {
        text: 'DTR has given me life-long friendships and a community.',
      },
      {
        text: 'The experience of working by yourself, reflecting about what gaps exist in your learning of the problem space, and planning how to overcome those problems, all while being in a supportive community with helpful peers, mentors and professor(s), is unique to DTR. ',
      },
      {
        text: 'Personally, DTR was a community for me where I felt accepted and supported by all members. Everyone was extremely approachable, open, and candid. This was enabled by a lot of structures past community members and Haoqi helped design. These structures prompt us to actively be involved, take responsibility and help each other out. Much like a symbiotic relationship, being a part of DTR is as much as giving to the community as learning from it, mutually helping one another grow.',
      },
      {
        text: 'Another specific aspect of DTR is the community— it is truly an inspiring community where we learn from each other and teach each other.',
      },
    ],
  },
  {
    descriptor: 'Students shared how DTR provides a mix of support and rigor:',
    quotes: [
      {
        text: 'I think DTR offers depth to the CS experience; depth in technical skills, depth in argumentation, and depth in thinking. Even the relationships that form in DTR offer more depth than regular classmate relationships.',
      },
      {
        text: 'When I think of DTR, I remember a strong feeling of warmth and caring, as well as a relentless push for excellence.',
      },
      {
        text: 'DTR provides students with a supportive, intellectually challenging community.',
      },
    ],
  },
  {
    descriptor:
      'And with support and rigor, students are able to do truly independent research, where they learn to drive the research:',
    quotes: [
      {
        text: 'The powerful part about DTR is that undergraduates are doing actual research, and doing research is challenging. As a result, I learned how to think critically and have the grit to overcome obstacles.',
      },
      {
        text: 'There are exceedingly few places where you can work on large projects for multiple quarters in CS, but this type of technical experience is invaluable when working.',
      },
      {
        text: 'DTR’s structure encourages students to tackle independent research projects, which is highly unusual for undergraduate research.',
      },
    ],
  },
  {
    descriptor:
      'Students learn how to self-direct complex work, which in turn gives them the confidence to do so:',
    quotes: [
      {
        text: 'DTR gives undergraduate students the rare opportunity to conduct truly independent research and fosters an environment in which they can succeed and prove to themselves that they can tackle novel problems.',
      },
      {
        text: 'I learned how to be curious, to think critically, to self-reflect, to seek help. It is because of DTR that I am confident in my work to tackle ambiguous problems, design entirely new systems, make important product decisions, talk with stakeholders, and collaborate with dynamic teams.',
      },
      {
        text: 'DTR’s unique teaching approach puts me in the driver’s seat from Day 1, for everything from setting high-level goals to planning weekly tasks. I never thought I could do research, but Haoqi and the community had so much faith in me even when myself did not.',
      },
      {
        text: 'There are plenty of skills I can directly point to that could have only been developed in the unique environment DTR provides: REAL design thinking, prioritization, self-directed project management, bottoms-up reasoning, effective argument development. But most importantly, DTR provided an opportunity to learn that I am capable of doing great work, and inspired the confidence in myself needed to tackle large problems that don’t have their answered listed in the back of a textbook.',
      },
    ],
  },
]

export default quoteChunks
