import { SupportSkills } from "@/src/data/skill";

interface SupportSkillSelectorProps {
  selectedSkill?: string;
  excludedSkills: string[];
  onChange: (skillName: string | undefined) => void;
}

export const SupportSkillSelector: React.FC<SupportSkillSelectorProps> = ({
  selectedSkill,
  excludedSkills,
  onChange,
}) => {
  const availableSkills = SupportSkills.filter(
    (skill) =>
      skill.name === selectedSkill || !excludedSkills.includes(skill.name),
  );

  const isEmpty = selectedSkill === undefined;

  return (
    <select
      className={`w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-sm ${
        isEmpty
          ? "text-zinc-400 dark:text-zinc-500"
          : "text-zinc-900 dark:text-zinc-100"
      }`}
      value={selectedSkill ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="" className="text-zinc-400 dark:text-zinc-500">
        &lt;Empty slot&gt;
      </option>
      {availableSkills.map((skill) => (
        <option key={skill.name} value={skill.name}>
          {skill.name}
        </option>
      ))}
    </select>
  );
};
