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
  const [ selectedUserIds, setSelectedUserIds ] = useState<Set<string>>(new Set());
  const [ activeTab, setActiveTab ] = useState("pepole");
  const [ targetCount, setTargetCount ] = useState(2);
  
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
  
  const formatToReadableDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleExtractSlots = () => {
    const allTimes = Array.from(new Set(
      data.users.flatMap(u => u.responses.map(r => new Date(r.time).getTime()))
    ));

    const activeCondition: FilterCondition[] = activeTab === "pepole" 
      ? [{ type: 'PARTICIPANTS', userIds: Array.from(selectedUserIds) }]
      : [{ type: 'EXACT_COUNT', count: targetCount }];

    const result = allTimes
      .filter(time => evaluateConditions(time, activeCondition))
      .sort((a, b) => a - b)
      .map(t => formatToReadableDate(t));
      
    console.log(result)
  };
  
  const handleReset = () => {
    setSelectedUserIds(new Set());
    setTargetCount(2);
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