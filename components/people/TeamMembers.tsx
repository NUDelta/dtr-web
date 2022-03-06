import { PartialPerson, Person } from "../../lib/people";

interface TeamMemberProps {
  groupId: string;
  members: PartialPerson[];
}

export default function TeamMembers({
  groupId,
  members,
}: TeamMemberProps): JSX.Element {
  const roles: string[] = [
    "Faculty",
    "Ph.D. Students",
    "Masters and Undergraduate Students",
  ];

  const roleMappingForFilter: Record<string, string[]> = {
    Faculty: ["Faculty"],
    "Ph.D. Students": ["Ph.D. Student", "Ph.D. Candidate"],
    "Masters and Undergraduate Students": [
      "Masters Student Researcher",
      "Undergraduate Student Researcher",
    ],
  };

  return (
    <div>
      {/* separate people into faculty, phd students, and ms/ugrad students */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 md:grid-flow-col md:auto-cols-max gap-4">
        {roles.map((role) => (
          <div
            key={`${groupId}-${role}`}
            className={`${role === roles[2] ? "row-span-2" : ""}`}
          >
            <h3 className="font-bold text-xl mb-2">{role}</h3>

            <MembersForRole
              members={members.filter((member) => {
                return roleMappingForFilter[role].includes(member.role);
              })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface MembersForRoleProps {
  members: PartialPerson[];
}

function MembersForRole({ members }: MembersForRoleProps): JSX.Element {
  const memberCount = members.length;

  return (
    <ul className="font-medium list-none">
      {memberCount > 0 ? (
        members.map((member) => (
          <li key={member.name}>
            {member.status == "Alumni" ? <>🎓&nbsp;</> : ""}
            {member.name}
          </li>
        ))
      ) : (
        <li className="italic">None</li>
      )}
    </ul>
  );
}
