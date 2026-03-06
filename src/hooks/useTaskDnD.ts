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
import { Task } from "../types/task.types";
import { isSameTaskLayout, moveTaskToDate } from "../utils/taskUtils";

interface DropTarget {
  date: string;
  index: number;
}

interface UseTaskDnDOptions {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  persistReorder: (nextTasks: Task[]) => Promise<void>;
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
  if (overId.startsWith("day-")) {
    const date = overId.replace("day-", "");
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

export const useTaskDnD = ({
  tasks,
  setTasks,
  persistReorder,
  disabled
}: UseTaskDnDOptions): UseTaskDnDResult => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>(tasks);
  const snapshotRef = useRef<Task[]>(tasks);
  const changedRef = useRef(false);
  const lastMoveKeyRef = useRef<string | null>(null);

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
      changedRef.current = false;
      lastMoveKeyRef.current = null;
    },
    [disabled]
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      if (disabled || !event.over) {
        return;
      }

      const activeId = String(event.active.id);
      const overId = String(event.over.id);
      const target = resolveDropTarget(tasksRef.current, overId);
      if (!target) {
        return;
      }

      const moveKey = `${activeId}|${target.date}|${target.index}`;
      if (lastMoveKeyRef.current === moveKey) {
        return;
      }

      setTasks((prev) => {
        const next = moveTaskToDate(prev, activeId, target.date, target.index);
        if (isSameTaskLayout(prev, next)) {
          return prev;
        }
        changedRef.current = true;
        tasksRef.current = next;
        lastMoveKeyRef.current = moveKey;
        return next;
      });
    },
    [disabled, setTasks]
  );

  const onDragCancel = useCallback(() => {
    if (!disabled) {
      setTasks(snapshotRef.current);
      tasksRef.current = snapshotRef.current;
    }
    setActiveTaskId(null);
    changedRef.current = false;
    lastMoveKeyRef.current = null;
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
        changedRef.current = false;
        lastMoveKeyRef.current = null;
        return;
      }

      if (changedRef.current) {
        await persistReorder(tasksRef.current);
      }

      setActiveTaskId(null);
      changedRef.current = false;
      lastMoveKeyRef.current = null;
    },
    [disabled, persistReorder, setTasks]
  );

  return { activeTask, onDragStart, onDragOver, onDragCancel, onDragEnd };
};
