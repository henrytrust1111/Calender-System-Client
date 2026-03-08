import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task } from "../types/task.types";
import { buildTasksByDate, isSameTaskLayout, normalizeTaskOrders } from "../utils/taskUtils";

interface DropTarget {
  date: string;
  index: number;
}

interface UseTaskDnDOptions {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  persistReorder: (
    taskId: string,
    sourceDate: string,
    destinationDate: string,
    nextTasks: Task[]
  ) => Promise<void>;
  disabled: boolean;
}

interface UseTaskDnDResult {
  activeTask: Task | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => Promise<void>;
}

const resolveDropTarget = (tasks: Task[], overId: string): DropTarget | null => {
  if (overId.startsWith("Droppable-")) {
    const date = overId.replace("Droppable-", "");
    const count = tasks.filter((task) => task.date === date).length;
    return { date, index: count };
  }

  const overTask = tasks.find((task) => task.id === overId);
  if (!overTask) {
    return null;
  }

  const dayTasks = tasks
    .filter((task) => task.date === overTask.date)
    .sort((a, b) => a.order - b.order);
  const index = dayTasks.findIndex((task) => task.id === overTask.id);
  return { date: overTask.date, index: Math.max(0, index) };
};

const moveTask = (
  tasks: Task[],
  activeTaskId: string,
  destinationDate: string,
  destinationIndex: number
): Task[] => {
  const grouped = buildTasksByDate(tasks);
  const sourceDate = Object.keys(grouped).find((date) =>
    (grouped[date] ?? []).some((task) => task.id === activeTaskId)
  );
  if (!sourceDate) {
    return tasks;
  }

  const sourceList = [...(grouped[sourceDate] ?? [])].sort((a, b) => a.order - b.order);
  const sourceIndex = sourceList.findIndex((task) => task.id === activeTaskId);
  if (sourceIndex < 0) {
    return tasks;
  }

  const [movedTask] = sourceList.splice(sourceIndex, 1);
  grouped[sourceDate] = sourceList;

  const destinationList =
    sourceDate === destinationDate
      ? sourceList
      : [...(grouped[destinationDate] ?? [])].sort((a, b) => a.order - b.order);

  // destinationIndex is computed against the pre-move list; inserting directly
  // after removing the source item matches dnd-kit arrayMove semantics.
  const clampedIndex = Math.max(0, Math.min(destinationIndex, destinationList.length));
  destinationList.splice(clampedIndex, 0, { ...movedTask, date: destinationDate });
  grouped[destinationDate] = destinationList;

  return normalizeTaskOrders(
    Object.keys(grouped)
      .sort()
      .flatMap((date) => grouped[date] ?? [])
  );
};

const reorderWithinDay = (
  tasks: Task[],
  date: string,
  activeTaskId: string,
  overId: string
): Task[] => {
  const dayTasks = tasks
    .filter((task) => task.date === date)
    .sort((a, b) => a.order - b.order);
  const oldIndex = dayTasks.findIndex((task) => task.id === activeTaskId);
  if (oldIndex < 0) {
    return tasks;
  }

  const overIndex = dayTasks.findIndex((task) => task.id === overId);
  const newIndex = overIndex >= 0 ? overIndex : dayTasks.length - 1;
  if (newIndex < 0 || oldIndex === newIndex) {
    return tasks;
  }

  const reordered = arrayMove(dayTasks, oldIndex, newIndex).map((task, index) => ({
    ...task,
    order: index
  }));
  const reorderedMap = new Map(reordered.map((task) => [task.id, task]));

  return normalizeTaskOrders(
    tasks.map((task) => reorderedMap.get(task.id) ?? task)
  );
};

export const useTaskDnD = ({
  tasks,
  setTasks,
  persistReorder,
  disabled
}: UseTaskDnDOptions): UseTaskDnDResult => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>(tasks);
  const snapshotRef = useRef<Task[]>(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks]
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      if (disabled) {
        return;
      }
      setActiveTaskId(String(event.active.id));
      snapshotRef.current = tasksRef.current;
    },
    [disabled]
  );

  const onDragOver = useCallback(
    (_event: DragOverEvent) => {
      // Drop logic is finalized in onDragEnd to avoid state rollback issues.
    },
    []
  );

  const onDragCancel = useCallback(() => {
    if (!disabled) {
      setTasks(snapshotRef.current);
      tasksRef.current = snapshotRef.current;
    }
    setActiveTaskId(null);
  }, [disabled, setTasks]);

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (disabled) {
        setActiveTaskId(null);
        return;
      }

      if (!event.over) {
        setTasks(snapshotRef.current);
        tasksRef.current = snapshotRef.current;
        setActiveTaskId(null);
        return;
      }
      const activeTaskId = String(event.active.id);
      const overId = String(event.over.id);
      const sourceTask = tasksRef.current.find((task) => task.id === activeTaskId);
      if (!sourceTask) {
        setActiveTaskId(null);
        return;
      }

      const overDateFromData = event.over.data.current?.date;
      const overTask = tasksRef.current.find((task) => task.id === overId);
      const destination = resolveDropTarget(tasksRef.current, overId);
      const destinationDate =
        (typeof overDateFromData === "string" ? overDateFromData : undefined) ??
        overTask?.date ??
        destination?.date;

      if (!destinationDate) {
        setActiveTaskId(null);
        return;
      }

      // Same-day reorder: always use arrayMove within that day.
      if (sourceTask.date === destinationDate) {
        const reorderedTasks = reorderWithinDay(
          tasksRef.current,
          destinationDate,
          activeTaskId,
          overId
        );
        if (!isSameTaskLayout(tasksRef.current, reorderedTasks)) {
          setTasks(reorderedTasks);
          tasksRef.current = reorderedTasks;
          await persistReorder(activeTaskId, sourceTask.date, destinationDate, reorderedTasks);
        }
        setActiveTaskId(null);
        return;
      }

      if (!destination) {
        setActiveTaskId(null);
        return;
      }

      const nextTasks = moveTask(
        tasksRef.current,
        activeTaskId,
        destinationDate,
        destination.index
      );
      if (!isSameTaskLayout(tasksRef.current, nextTasks)) {
        // Update UI immediately, then persist to backend.
        setTasks(nextTasks);
        tasksRef.current = nextTasks;
        await persistReorder(activeTaskId, sourceTask.date, destinationDate, nextTasks);
      }

      setActiveTaskId(null);
    },
    [disabled, persistReorder, setTasks]
  );

  return { activeTask, onDragStart, onDragOver, onDragCancel, onDragEnd };
};
