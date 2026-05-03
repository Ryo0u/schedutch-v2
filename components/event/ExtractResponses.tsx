import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";

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

function ExtractResponses({ data }: ExtractProps) {
  const [ selectedUserIds, setSelectedUserIds ] = useState<Set<string>>(new Set())
  
  const toggleUserId = (userId: string) => {
    setSelectedUserIds(prev => {
    const next = new Set(prev);
    
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }

    return next;
  });
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
      <CardContent className="flex">
        <Tabs defaultValue="pepole" className="flex-1">
          <TabsList variant="line">
            <TabsTrigger value="pepole">参加者を選択</TabsTrigger>
            <TabsTrigger value="number">人数を選択</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pepole">
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {data.users.map((user) => (
                <Field key={user.id} orientation="horizontal">
                  <Checkbox
                    id={user.id}
                    checked={selectedUserIds.has(user.id) ? true : false} 
                    onCheckedChange={() => toggleUserId(user.id)}                   
                  />
                  <FieldLabel htmlFor={user.id}>{user.name}</FieldLabel>  
                </Field>
              ))}
            </FieldGroup>
          </TabsContent>
          
          <TabsContent value="number">
            
          </TabsContent>
        </Tabs>
        
        <div className="flex-1">{/* ここにテキストエリア */}</div>
      </CardContent>
    </Card>
  )
}

export default ExtractResponses