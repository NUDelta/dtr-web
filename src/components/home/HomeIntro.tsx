const grants = [
  {
    href: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=1618096',
    label: 'Cyber-Human Systems',
  },
  {
    href: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=1623635',
    label: 'Cyberlearning',
  },
  {
    href: 'https://www.nsf.gov/awardsearch/showAward?AWD_ID=1464315',
    label: 'Research Initiation Initiative',
  },
  {
    href: 'http://fuse.microsoft.com/research/award',
    label: 'Microsoft FUSE Labs Research Award',
  },
  {
    href: 'https://www.mccormick.northwestern.edu/alumni/murphy-society-awards/',
    label: 'Murphy Society Grant',
  },
  {
    href: 'https://digitallearning.northwestern.edu/article/2017/04/17/their-own-words-pair-research',
    label: 'Office of the Provost Award for Digital Learning',
  },
  {
    href: 'http://cs.northwestern.edu/',
    label: 'Department of Computer Science',
  },
  {
    href: 'http://segal.northwestern.edu/',
    label: 'Segal Design Institute',
  },
]

interface HomeIntroProps {
  className?: string
}

const HomeIntro = ({ className }: HomeIntroProps) => {
  return (
    <div className={`prose w-full md:w-1/3 ${className}`}>
      <h2>Design, Technology, and Research (DTR)</h2>

      <p>
        In DTR, we develop systems that shape new experiences with people and
        technology. We are designers, builders, and researchers. We are
        undergrads, grads, and faculty. We are a community who support one
        another, work hard together, learn together, laugh together, have a
        good time together, struggle together. We design solutions to address
        people’s needs, explore new technologies that capture our imagination,
        and challenge ourselves to advance the state of the art through
        research.
      </p>

      <p className="text-xs">
        <span>DTR projects are generously supported by</span>
        {' '}
        {grants.map((grant, index) => (
          <span key={grant.href}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={grant.href}
            >
              {grant.label}
            </a>
            {index < grants.length - 1 ? ', ' : '.'}
          </span>
        ))}
      </p>
    </div>
  )
}

export default HomeIntro
