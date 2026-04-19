import { Calendar, MessageSquare } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator";

interface EventInfoProps {
  data: {
    title: string;
    comment: string;
  };
}

function EventInfo({data}: EventInfoProps) {
  return (
    <div className="flex flex-col gap-4 mt-5">
      
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary shadow-sm">
          <Calendar className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            {data.title}
          </h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {data.comment || "コメントはありません"}
          </p>
        </div>
      </div>

    </div>
  )
}

export default EventInfo