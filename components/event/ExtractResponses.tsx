import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "../ui/input-group";
import { ChevronDownIcon, CopyIcon, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

interface ExtractProps {
  data: {
    users: {
      id: string;
      name: string;
      responses: {
        id: string;
        status: string;
        time:  Date;
      }[];
    }[];
  }
}

// 抽出条件を管理
type FilterCondition = 
  | { type: 'PARTICIPANTS'; userIds: string[] }
  | { type: 'HEADCOUNTS'; counts: number[] }
  | { type: 'DURATION'; minMinutes: number };
  
type ParticipantInfo = { name: string; status: string };
type TimeBlock = { start: number; end: number; participants: ParticipantInfo[] };

function ExtractResponses({ data }: ExtractProps) {
  const SLOT_INTERVAL = 30 * 60 * 1000;
  
  const [ selectedUserIds, setSelectedUserIds ] = useState<Set<string>>(new Set());
  const [ activeTab, setActiveTab ] = useState("pepole");
  const [ selectedHeadcounts, setSelectedHeadcounts ] = useState<Set<number>>(new Set());
  const [ includeMaybe, setIncludeMaybe ] = useState(false);
  const [ minDuration, setMinDuration ] = useState(60);
  const [ availableSlots, setAvailableSlots ] = useState<string[]>([]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setAvailableSlots([]);

    if (value === "pepole") {
      setSelectedHeadcounts(new Set());
    } else {
      setSelectedUserIds(new Set());
    }
  };
  
  const handleReset = () => {
    setSelectedUserIds(new Set());
    setSelectedHeadcounts(new Set());
    setAvailableSlots([]);
    setIncludeMaybe(false);
  };
  
  // -------- ヘルパー関数 -----------
  
  const isUserAvailable = (user: ExtractProps['data']['users'][0], time: number) => {
    const res = user.responses.find(r => new Date(r.time).getTime() === time);
    if (!res) return false;
    if (res.status === 'ok') return true;
    if (includeMaybe && res.status === 'maybe') return true;
    return false;
  };
  
  const areParticipantsEqual = (p1: ParticipantInfo[], p2: ParticipantInfo[]) => {
    if (p1.length !== p2.length) return false;
    const s1 = [...p1].sort((a, b) => a.name.localeCompare(b.name));
    const s2 = [...p2].sort((a, b) => a.name.localeCompare(b.name));
    return s1.every((val, index) => val.name === s2[index]?.name && val.status === s2[index]?.status);
  };
  
  // 一コマ単位のルールを適応
  const checkSlotConditions = (time: number, conditions: FilterCondition[]): boolean => {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'PARTICIPANTS':
          return condition.userIds.every(uid => {
            const user = data.users.find(u => u.id === uid);
            return user ? isUserAvailable(user, time) : false;
          });
        case 'HEADCOUNTS':
          const count = data.users.filter(u => isUserAvailable(u, time)).length;
          return condition.counts.includes(count);
        default:
          return true;
      }
    });
  };
  
  // 連続した時間の塊を作成
  const createMergedBlocks = (times: number[]): TimeBlock[] => {
    return times.reduce((acc: TimeBlock[], time) => {
      // この時間の参加者リストを作成
      const currentParticipants = data.users
        .filter(u => isUserAvailable(u, time) && (activeTab === "pepole" ? selectedUserIds.has(u.id) : true))
        .map(u => ({
          name: u.name,
          status: u.responses.find((r: any) => new Date(r.time).getTime() === time)?.status || 'ok'
        }));

      const lastBlock = acc[acc.length - 1];
      // 「時間が連続」かつ「参加者と状態が一致」なら結合
      if (lastBlock && time === lastBlock.end + SLOT_INTERVAL && areParticipantsEqual(lastBlock.participants, currentParticipants)) {
        lastBlock.end = time;
      } else {
        acc.push({ start: time, end: time, participants: currentParticipants });
      }
      return acc;
    }, []);
  };
  
  // 塊単位のルールを適応
  const checkBlockConditions = (block: TimeBlock, conditions: FilterCondition[]) => {
    return conditions.every(cond => {
      switch (cond.type) {
        case 'DURATION':
          const durationMs = (block.end + SLOT_INTERVAL) - block.start;
          return durationMs >= cond.minMinutes * 60 * 1000;
        default:
          return true;
      }
    });
  };
  
  const formatExtractTimes = (blocks: TimeBlock[]): string[] => {
    const result: string[] = [];
    
    const grouped = blocks.reduce((acc, block) => {
      const dateKey = new Date(block.start).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(block);
      return acc;
    }, {} as Record<string, TimeBlock[]>);

    Object.entries(grouped).forEach(([date, daysBlocks]) => {
      result.push(date);
      daysBlocks.forEach(block => {
        const start = new Date(block.start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        const end = new Date(block.end + SLOT_INTERVAL).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        // 表示時に maybe の人には (▲) を付ける
        const names = block.participants.map(p => p.status === 'maybe' ? `${p.name}(▲)` : p.name).join(', ');
        result.push(`${start} - ${end} : ${names}`);
      });
      result.push("");
    });
    
    return result;
  }
  
  // -------- メインロジック ------------
  
  const handleExtractSlots = () => {
    // 全タイムスタンプの取得
    const allTimes = Array.from(new Set(
      data.users.flatMap(u => u.responses.map(r => new Date(r.time).getTime()))
    )).sort((a, b) => a - b);

    // 条件リストの作成
    const conditions: FilterCondition[] = [
      activeTab === "pepole" 
        ? { type: 'PARTICIPANTS', userIds: Array.from(selectedUserIds) }
        : { type: 'HEADCOUNTS', counts: Array.from(selectedHeadcounts) },
      { type: 'DURATION', minMinutes: minDuration }
    ];

    // 実行フロー
    const filteredTimes = allTimes.filter(t => checkSlotConditions(t, conditions));
    const mergedBlocks = createMergedBlocks(filteredTimes);
    const finalBlocks = mergedBlocks.filter(b => checkBlockConditions(b, conditions));
      
    const displayResult = formatExtractTimes(finalBlocks);
    setAvailableSlots(displayResult);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black">予定抽出</CardTitle>
        <CardDescription>
          回答した参加者の予定から条件に合った日程を抽出することができます
        </CardDescription>
      </CardHeader>
      <Separator/>
      <CardContent className="flex flex-col sm:flex-row gap-5">
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="pepole" onValueChange={handleTabChange} className="flex-1 mb-5">
            <TabsList variant="line" className="mb-2">
              <TabsTrigger value="pepole">参加者を選択</TabsTrigger>
              <TabsTrigger value="number">人数を選択</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pepole">
              <FieldGroup className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {data.users.map((user) => (
                  <Field key={user.id} orientation="horizontal">
                    <Checkbox
                      id={user.id}
                      checked={selectedUserIds.has(user.id)} 
                      onCheckedChange={() => {
                        setSelectedUserIds(prev => {
                          const next = new Set(prev);
                          next.has(user.id) ? next.delete(user.id) : next.add(user.id);
                          return next;
                        });
                      }}                   
                    />
                    <FieldLabel htmlFor={user.id}>{user.name}</FieldLabel>  
                  </Field>
                ))}
              </FieldGroup>
            </TabsContent>
            
            <TabsContent value="number">
              <FieldGroup className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[...Array(data.users.length).keys()].map(i => i + 1).map((num) => (
                  <Field key={num} orientation="horizontal" className="items-center">
                    <Checkbox
                      id={`count-${num}`}
                      checked={selectedHeadcounts.has(num)} 
                      onCheckedChange={() => {
                        setSelectedHeadcounts(prev => {
                          const next = new Set(prev);
                          next.has(num) ? next.delete(num) : next.add(num);
                          return next;
                        });
                      }}                   
                    />
                    <FieldLabel htmlFor={`count-${num}`}>{num}人</FieldLabel>  
                  </Field>
                ))}
              </FieldGroup>
            </TabsContent>
          </Tabs>
          
          <Separator className="mb-5"/>
          
          <div className="flex-2 mb-5">
            <Collapsible className="rounded-md data-open:bg-muted">
              <CollapsibleTrigger 
                render={
                  <Button variant="ghost" className="w-full">
                    <Plus/>条件を追加<ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
                  </Button>
                }
              />
              <CollapsibleContent className="p-2">
                <Field orientation="horizontal" className="justify-start gap-2">
                  <Checkbox 
                    id="include-maybe" 
                    checked={includeMaybe} 
                    onCheckedChange={(checked) => setIncludeMaybe(!!checked)} 
                  />
                  <FieldLabel htmlFor="include-maybe" className="text-sm cursor-pointer">
                    ▲（未定）も予定に含める
                  </FieldLabel>
                </Field>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">条件をリセット</Button>
            <Button 
              onClick={handleExtractSlots} 
              disabled={activeTab === "pepole" ? selectedUserIds.size === 0 : selectedHeadcounts.size === 0} 
              className="flex-2"
            >
              抽出する
            </Button>
          </div>
        </div>
        
        <div className="flex-1">
          <InputGroup>
            <InputGroupTextarea
              className="h-64 flex-none overflow-y-auto resize-none"
              readOnly
              value={availableSlots.join('\n')}
            />
              <InputGroupAddon align="block-start" className="border-b flex justify-between">
                <InputGroupText>抽出結果</InputGroupText>
                <InputGroupButton variant="ghost" size="icon-xs" onClick={() => navigator.clipboard.writeText(availableSlots.join('\n'))}>
                  <CopyIcon/>
                </InputGroupButton>
              </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExtractResponses