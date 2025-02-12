/**
 * Sorts an array of people based on status and role.
 * People are categorized into:
 * - Active members
 * - Alumni
 * - Special case: "Stella"
 *
 * Within each category, people are sorted by:
 * - Faculty (predefined order)
 * - Ph.D. Candidates → Ph.D. Students (sorted alphabetically)
 * - Master's students → Undergraduate students (sorted alphabetically)
 *
 * @param {Person[]} people - The array of people to sort.
 * @returns {Person[]} The sorted array of people.
 *
 * @example
 * const sortedPeople = sortPeople(peopleArray);
 * console.log(sortedPeople);
 */
export function sortPeople(people: Person[]): Person[] {
  // Predefined faculty sorting order
  const facultyOrder = new Map([
    ['Haoqi Zhang', 1],
    ['Eleanor "Nell" O\'Rourke', 2],
    ['Matt Easterday', 3],
    ['Liz Gerber', 4],
  ]);

  // Predefined Ph.D. role order
  const phdOrder = new Map([
    ['Ph.D. Candidate', 1],
    ['Ph.D. Student', 2],
  ]);

  // Categorize people
  const categories = {
    active: [] as Person[],
    alumni: [] as Person[],
    stella: [] as Person[],
  };

  people.forEach((person) => {
    if (person.name === 'Stella') {
      categories.stella.push(person);
    }
    else if (person.status === 'Active') {
      categories.active.push(person);
    }
    else if (person.status === 'Alumni') {
      categories.alumni.push(person);
    }
  });

  // Sorting function by role
  const sortByRole = (people: Person[]): Person[] => {
    // Sort faculty
    const faculty = people.filter(p => p.role === 'Faculty').sort(
      (a, b) => (facultyOrder.get(a.name) ?? Infinity) - (facultyOrder.get(b.name) ?? Infinity),
    );

    // Sort Ph.D. candidates and students
    const phd = people.filter(p => phdOrder.has(p.role)).sort(
      (a, b) => (phdOrder.get(a.role) ?? Infinity) - (phdOrder.get(b.role) ?? Infinity)
        || a.name.localeCompare(b.name),
    );

    // Sort Master's and Undergraduate students
    const masters = people.filter(p => p.role === 'Masters Student Researcher')
      .sort((a, b) => a.name.localeCompare(b.name));

    const ugrads = people.filter(p => p.role === 'Undergraduate Student Researcher')
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...faculty, ...phd, ...masters, ...ugrads];
  };

  return [...sortByRole(categories.active), ...categories.stella, ...sortByRole(categories.alumni)];
}
