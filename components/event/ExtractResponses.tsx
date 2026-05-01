import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface ExtractProps {
  data: {
    user: {
      name: string;
      responses: {
        id: string;
        status: string;
        time:  Date;
      };
    };
  }
}

function ExtractResponses({ data }: ExtractProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-black">予定抽出</CardTitle>
        <CardDescription>
          回答した参加者の予定から条件に合った日程を抽出することができます
        </CardDescription>
      </CardHeader>
      <Separator/>
      <CardContent>
        
      </CardContent>
    </Card>
  )
}

export default ExtractResponses