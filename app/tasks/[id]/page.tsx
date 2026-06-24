import { TaskDetailsClient } from "@/app/tasks/[id]/TaskDetailsClient";

type TaskDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { id } = await params;
  const taskId = /^\d+$/.test(id) ? BigInt(id) : null;

  return <TaskDetailsClient taskId={taskId} />;
}
