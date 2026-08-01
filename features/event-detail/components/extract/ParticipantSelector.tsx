import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/features/event-detail/types";
import type { ExtractTab } from "./hooks/useExtractSlots";

interface ParticipantSelectorProps {
  users: Pick<User, "id" | "name">[];
  activeTab: ExtractTab;
  selectedUserIds: Set<string>;
  selectedHeadcounts: Set<number>;
  onTabChange: (value: ExtractTab) => void;
  onToggleUser: (userId: string) => void;
  onToggleHeadcount: (count: number) => void;
}

function ParticipantSelector({
  users,
  activeTab,
  selectedUserIds,
  selectedHeadcounts,
  onTabChange,
  onToggleUser,
  onToggleHeadcount,
}: ParticipantSelectorProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ExtractTab)} className="flex-1 mb-5">
      <TabsList variant="line" className="mb-2">
        <TabsTrigger value="people">参加者を選択</TabsTrigger>
        <TabsTrigger value="number">人数を選択</TabsTrigger>
      </TabsList>

      <TabsContent value="people">
        <FieldGroup className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {users.map((user) => (
            <Field key={user.id} orientation="horizontal">
              <Checkbox
                id={`extract-user-${user.id}`}
                checked={selectedUserIds.has(user.id)}
                onCheckedChange={() => onToggleUser(user.id)}
              />
              <FieldLabel htmlFor={`extract-user-${user.id}`}>{user.name}</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </TabsContent>

      <TabsContent value="number">
        <FieldGroup className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[...Array(users.length).keys()].map(i => i + 1).map((num) => (
            <Field key={num} orientation="horizontal" className="items-center">
              <Checkbox
                id={`count-${num}`}
                checked={selectedHeadcounts.has(num)}
                onCheckedChange={() => onToggleHeadcount(num)}
              />
              <FieldLabel htmlFor={`count-${num}`}>{num}人</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </TabsContent>
    </Tabs>
  );
}

export default ParticipantSelector;
