import type { selectTasksSchema } from "@teamapp/api/schema";

import Task from "./task";

export default function TaskList({ tasks }: { tasks: selectTasksSchema[] }) {
  return tasks.map(task => (
    <Task task={task} key={task.id} />
  ));
}
