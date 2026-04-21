"use client"

import { Button } from "@/components/ui/button";
import { useState } from "react";
import InputResponses from "./InputResponses";

interface EventCandidatesProps {
  data: {
    candidates: []
  };
}

export default function JoinButton({ data }: EventCandidatesProps) {
  const [ isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        size="lg" 
        className="rounded-full px-8 font-bold" 
        onClick={() => setIsOpen(true)}
      >
        予定を回答する
      </Button>
    
      <InputResponses data={data} open={isOpen} onOpenChange={setIsOpen}/>
    </>
    
  );
}