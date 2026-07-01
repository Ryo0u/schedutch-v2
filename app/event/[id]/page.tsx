import { EventClient } from "@/features/event";

export default async function Event({ params }: { params: Promise<{ id: string }> }) {
  const eventId = (await params).id;
  return <EventClient eventId={eventId} />;
}