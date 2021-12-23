import { Person } from "../../lib/people";

interface TeamMemberProps {
    groupId: string;
    members: Person[];
}

export default function TeamMembers({ groupId, members }: TeamMemberProps): JSX.Element {
    const roles: string[] = [
      "Faculty",
      "Ph.D. Students",
      "Masters and Undergraduate Students"
    ];

    const roleMappingForFilter: Record<string, string[]> = {
      "Faculty": ["Faculty"],
      "Ph.D. Students": ["Ph.D. Student", "Ph.D. Candidate"],
      "Masters and Undergraduate Students": [
        "Masters Student Researcher",
        "Undergraduate Student Researcher"
      ]
    };

    return (
        <div>
          {/* separate people into faculty, phd students, and ms/ugrad students */}
          <div className="grid grid-cols-2 grid-rows-2 grid-flow-col auto-cols-max">
            {roles.map((role) => (
              <div
                key={`${groupId}-${role}`}
                className={`${role === roles[2] ? "row-span-2": ""} mb-2`}
              >
                <h3 className="font-bold text-xl mb-2">
                  {role}
                </h3>

                <MembersForRole members={members.filter((member) => {
                    return roleMappingForFilter[role].includes(member.role);
                  })}
                />
              </div>
              ))}
          </div>
        </div>
    );
};

interface MembersForRoleProps {
  members: Person[];
}

function MembersForRole({ members }: MembersForRoleProps): JSX.Element {
  const memberCount = members.length;

  return (
    <ul className="font-medium">
      {
        memberCount > 0 ? members.map((member) => (
          <li key={member.name}>
            {member.status == "Alumni" ? "🎓" : ""} {member.name}
          </li>
        )) :
        <li className="italic">
          None
        </li>
      }
    </ul>
  );
};
