import type { Metadata } from 'next';
import questionsAndAnswers from '@/components/faq/questionsAndAnswers';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | DTR',
  alternates: { canonical: 'https://dtr.northwestern.edu/faq' },
};

export default function Faq() {
  return (
    <div className="prose mx-auto max-w-4xl">
      <h2>Frequently Asked Questions</h2>

      {/* Populate questions and answers */}
      <div className="space-y-6">
        {questionsAndAnswers.map(qa => (
          <div key={String(qa.question)} className="">
            <h5 className="text-lg font-semibold">{qa.question}</h5>
            {qa.answer}
          </div>
        ))}
      </div>
    </div>
  );
}
