import EventForm from 
  '@/components/admin/EventForm'

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <EventForm eventId={id} />
}
