import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Button } from "../ui/button";

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
  | { type: 'EXACT_COUNT'; count: number };

function ExtractResponses({ data }: ExtractProps) {
  const SLOT_INTERVAL = 30 * 60 * 1000;
  
  const [ selectedUserIds, setSelectedUserIds ] = useState<Set<string>>(new Set());
  const [ activeTab, setActiveTab ] = useState("pepole");
  const [ targetCount, setTargetCount ] = useState(2);
  const [ availableSlots, setAvailableSlots ] = useState<string[]>([]);
  
  const evaluateConditions = (time: number, conditions: FilterCondition[]): boolean => {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'PARTICIPANTS':
          return condition.userIds.every(uid => 
            data.users.find(u => u.id === uid)?.responses.some(r => new Date(r.time).getTime() === time && r.status === 'ok')
          );
        case 'EXACT_COUNT':
          const okCount = data.users.filter(u => 
            u.responses.some(r => new Date(r.time).getTime() === time && r.status === 'ok')
          ).length;
          return okCount === condition.count;
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
      : [{ type: 'EXACT_COUNT', count: targetCount }];

    // 3. 条件に合う時刻を絞り込む
    const filteredTimes = allTimes.filter(time => evaluateConditions(time, activeCondition));

    // 4. 時刻を結合してブロック化する
    type TimeBlock = { start: number; end: number; participants: string[] };
    
    const mergedBlocks = filteredTimes.reduce((acc: TimeBlock[], time) => {
      // 選択したユーザー全員がOKしているか再度確認し、名前リストを作成
      const selectedUsers = data.users.filter(u => 
        selectedUserIds.has(u.id) && 
        u.responses.some(r => new Date(r.time).getTime() === time && r.status === 'ok')
      );
      
      const participants = selectedUsers.map(u => u.name);
      const lastBlock = acc[acc.length - 1];

      // 前のブロックと時間が連続しているか (30分間隔)
      if (lastBlock && time === lastBlock.end + 30 * 60 * 1000) {
        lastBlock.end = time;
      } else {
        acc.push({ start: time, end: time, participants });
      }
      return acc;
    }, []);

    // 5. 文字列にフォーマットしてセット
    const result = mergedBlocks.map(block => {
      const start = new Date(block.start).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const end = new Date(block.end + 30 * 60 * 1000).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      return `${start} - ${end} : ${block.participants.join(', ')}`;
    });
      
    setAvailableSlots(result);
    console.log(result)
  };
  
  const handleReset = () => {
    setSelectedUserIds(new Set());
    setTargetCount(2);
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
      <CardContent className="flex flex-col sm:flex-row">
        <div className="flex-1">
          <Tabs defaultValue="pepole" onValueChange={setActiveTab} className="mb-2">
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
              
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">条件をリセット</Button>
            <Button onClick={handleExtractSlots} className="flex-2">抽出する</Button>
          </div>
        </div>
        
        <div className="flex-1">{/* ここにテキストエリア */}</div>
      </CardContent>
    </Card>
  )
}

export default ExtractResponses