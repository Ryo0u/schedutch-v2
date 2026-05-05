import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "../ui/input-group";
import { CopyIcon } from "lucide-react";

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
  | { type: 'HEADCOUNTS'; counts: number[] };

function ExtractResponses({ data }: ExtractProps) {
  const SLOT_INTERVAL = 30 * 60 * 1000;
  
  const [ selectedUserIds, setSelectedUserIds ] = useState<Set<string>>(new Set());
  const [ activeTab, setActiveTab ] = useState("pepole");
  const [ selectedHeadcounts, setSelectedHeadcounts ] = useState<Set<number>>(new Set());
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
  
  const evaluateConditions = (time: number, conditions: FilterCondition[]): boolean => {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'PARTICIPANTS':
          return condition.userIds.every(uid => 
            data.users.find(u => u.id === uid)?.responses.some(r => new Date(r.time).getTime() === time && r.status === 'ok')
          );
        case 'HEADCOUNTS':
          const okCount = data.users.filter(u => 
            u.responses.some(r => new Date(r.time).getTime() === time && r.status === 'ok')
          ).length;
          return condition.counts.includes(okCount);
        default:
          return true;
      }
    });
  };
  
  const handleExtractSlots = () => {
    // 1. すべての回答時間を抽出
    const allTimes = Array.from(new Set(
      data.users.flatMap(u => u.responses.map(r => new Date(r.time).getTime()))
    )).sort((a, b) => a - b);

    // 2. 条件（参加者選択 or 人数）を決定
    const activeCondition: FilterCondition[] = activeTab === "pepole" 
      ? [{ type: 'PARTICIPANTS', userIds: Array.from(selectedUserIds) }]
      : [{ type: 'HEADCOUNTS', counts: Array.from(selectedHeadcounts) }];

    // 3. 条件に合う時刻を絞り込む
    const filteredTimes = allTimes.filter(time => evaluateConditions(time, activeCondition));

    // 4. 時刻をブロック化
    type TimeBlock = { start: number; end: number; participants: string[] };
    
    // 参加者が一致しているか比較する関数
    const areParticipantsEqual = (p1: string[], p2: string[]) => {
      if (p1.length !== p2.length) return false;
      const sorted1 = [...p1].sort();
      const sorted2 = [...p2].sort();
      return sorted1.every((val, index) => val === sorted2[index]);
    };

    const mergedBlocks = filteredTimes.reduce((acc: TimeBlock[], time) => {
      const selectedUsers = data.users.filter(u => {
        const isOk = u.responses.some(r => new Date(r.time).getTime() === time && r.status === 'ok');
        return isOk && (activeTab === "pepole" ? selectedUserIds.has(u.id) : true);
      });
      
      const participants = selectedUsers.map(u => u.name);
      const lastBlock = acc[acc.length - 1];

      // 結合条件：
      // 時間が連続している
      // 参加者が全く同じメンバーである
      if (
        lastBlock && 
        time === lastBlock.end + SLOT_INTERVAL && 
        areParticipantsEqual(lastBlock.participants, participants)
      ) {
        lastBlock.end = time;
      } else {
        acc.push({ start: time, end: time, participants });
      }
      return acc;
    }, []);

    // 5. 文字列にフォーマットしてセット
    const result: string[] = [];

      // 日付ごとにグループ化
    const grouped = mergedBlocks.reduce((acc, block) => {
      const dateKey = new Date(block.start).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(block);
      return acc;
    }, {} as Record<string, TimeBlock[]>);

      // グループ化したデータを文字列配列に変換
    Object.entries(grouped).forEach(([date, blocks]) => {
      result.push(date);
      blocks.forEach(block => {
        const start = new Date(block.start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        const end = new Date(block.end + SLOT_INTERVAL).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        result.push(`${start} - ${end} : ${block.participants.join(', ')}`);
      });
      result.push(""); //日付間の空行
    });
      
    setAvailableSlots(result);
    console.log(result)
  };
  
  const handleReset = () => {
    setSelectedUserIds(new Set());
    setSelectedHeadcounts(new Set());
    setAvailableSlots([]);
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