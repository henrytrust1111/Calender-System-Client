import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { taskService } from "../services/taskService";
import { Task } from "../types/task.types";
import { normalizeTaskOrders } from "../utils/taskUtils";

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  createTask: (title: string, date: string) => Promise<void>;
  updateTask: (taskId: string, title: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  persistReorder: (
    taskId: string,
    sourceDate: string,
    destinationDate: string,
    nextTasks: Task[]
  ) => Promise<void>;
}

const buildReorderItemsForDate = (tasks: Task[], date: string) =>
  tasks
    .filter((task) => task.date === date)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({
      id: task.id,
      order: index
    }));

export const useTasks = (currentMonth: Date): UseTasksResult => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>([]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1
      );
      setTasks(normalizeTaskOrders(data));
    } catch {
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    void loadTasks();
  }, [currentMonth, loadTasks]);

  const createTask = useCallback(async (title: string, date: string) => {
    setSaving(true);
    setError(null);
    try {
      const created = await taskService.createTask({ title, date });
      setTasks((prev) => {
        const existingCount = prev.filter((task) => task.date === date).length;
        return normalizeTaskOrders([
          ...prev,
          {
            ...created,
            order: created.order ?? existingCount
          }
        ]);
      });
    } catch {
      setError("Unable to create task.");
    } finally {
      setSaving(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, title: string) => {
    const previousTasks = tasksRef.current;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, title } : task)));
    setSaving(true);
    setError(null);

    try {
      const updated = await taskService.updateTask(taskId, { title });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, ...updated } : task))
      );
    } catch {
      setTasks(previousTasks);
      setError("Unable to update task.");
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    const previousTasks = tasksRef.current;
    setTasks((prev) => normalizeTaskOrders(prev.filter((task) => task.id !== taskId)));
    setSaving(true);
    setError(null);
    try {
      await taskService.deleteTask(taskId);
    } catch {
      setTasks(previousTasks);
      setError("Unable to delete task.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistReorder = useCallback(
    async (taskId: string, sourceDate: string, destinationDate: string, nextTasks: Task[]) => {
      setSaving(true);
      setError(null);
      try {
        // Reorder endpoint is only for within-day ordering.
        if (sourceDate === destinationDate) {
          const items = buildReorderItemsForDate(nextTasks, destinationDate);
          if (items.length > 0) {
            await taskService.reorderTasks({ tasks: items });
          }
        } else {
          // Moving across days is done via the task update endpoint.
          await taskService.updateTask(taskId, { date: destinationDate });
        }
      } catch {
        setError("Unable to save task order.");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return useMemo(
    () => ({
      tasks,
      loading,
      saving,
      error,
      setTasks,
      createTask,
      updateTask,
      deleteTask,
      persistReorder
    }),
    [tasks, loading, saving, error, createTask, deleteTask, persistReorder, updateTask]
  );
};
