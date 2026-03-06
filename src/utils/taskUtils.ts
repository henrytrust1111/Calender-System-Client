import { Task } from "../types/task.types";

export const normalizeTaskOrders = (tasks: Task[]): Task[] => {
  const byDate = new Map<string, Task[]>();

  tasks.forEach((task) => {
    const list = byDate.get(task.date) ?? [];
    list.push(task);
    byDate.set(task.date, list);
  });

  return Array.from(byDate.keys())
    .sort()
    .flatMap((date) =>
      (byDate.get(date) ?? [])
        .sort((a, b) => a.order - b.order)
        .map((task, index) => ({ ...task, date, order: index }))
    );
};

export const buildTasksByDate = (tasks: Task[]): Record<string, Task[]> => {
  const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {});

  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => a.order - b.order);
  });

  return grouped;
};

export const moveTaskToDate = (
  tasks: Task[],
  taskId: string,
  toDate: string,
  toIndex: number
): Task[] => {
  const byDate = buildTasksByDate(tasks);
  const sourceDate = Object.keys(byDate).find((date) =>
    byDate[date].some((task) => task.id === taskId)
  );

  if (!sourceDate) {
    return tasks;
  }

  const sourceTasks = [...byDate[sourceDate]].sort((a, b) => a.order - b.order);
  const sourceIndex = sourceTasks.findIndex((task) => task.id === taskId);
  if (sourceIndex < 0) {
    return tasks;
  }

  const [movingTask] = sourceTasks.splice(sourceIndex, 1);
  byDate[sourceDate] = sourceTasks;

  const targetTasks = [...(byDate[toDate] ?? [])].sort((a, b) => a.order - b.order);
  const clampedIndex = Math.max(0, Math.min(toIndex, targetTasks.length));
  targetTasks.splice(clampedIndex, 0, { ...movingTask, date: toDate });
  byDate[toDate] = targetTasks;

  return normalizeTaskOrders(
    Object.keys(byDate)
      .sort()
      .flatMap((date) => byDate[date])
  );
};

export const isSameTaskLayout = (left: Task[], right: Task[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a.id !== b.id || a.date !== b.date || a.order !== b.order || a.title !== b.title) {
      return false;
    }
  }

  return true;
};
