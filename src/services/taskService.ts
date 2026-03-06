import { api } from "./api";
import {
  CreateTaskPayload,
  ReorderPayload,
  Task,
  UpdateTaskPayload
} from "../types/task.types";

interface TaskListResponse {
  tasks?: Task[];
}

interface TaskApiEnvelope {
  success?: boolean;
  message?: string;
  data?: {
    items?: Array<Partial<Task> & { id?: string | number; _id?: string }>;
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
    };
  };
}

type TaskApiResponse = Task | { task?: Task };

const normalizeTask = (task: Partial<Task> & { id?: string | number; _id?: string }): Task => {
  const rawDate = String(task.date ?? "");
  const normalizedDate = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
  return {
    id: String(task.id ?? task._id ?? ""),
    title: String(task.title ?? ""),
    date: normalizedDate,
    order: Number(task.order ?? 0),
    color: task.color
  };
};

const extractTask = (payload: TaskApiResponse): Task | undefined => {
  if ("task" in payload) {
    return payload.task;
  }
  if ("id" in payload && "title" in payload && "date" in payload) {
    return payload;
  }
  return undefined;
};

const isTaskApiEnvelope = (payload: TaskApiEnvelope | TaskListResponse): payload is TaskApiEnvelope =>
  "data" in payload;

export const taskService = {
  async getTasks(year: number, month: number): Promise<Task[]> {
    const response = await api.get<TaskApiEnvelope | Task[] | TaskListResponse>("/tasks", {
      params: { year, month: String(month).padStart(2, "0") }
    });

    const payload = response.data;
    const rawItems: Array<Partial<Task> & { id?: string | number; _id?: string }> =
      Array.isArray(payload)
        ? payload
        : isTaskApiEnvelope(payload)
          ? payload.data?.items ?? []
          : payload.tasks ?? [];
    console.log("Tasks from API:", rawItems);

    return rawItems
      .map((task, index) => {
        const normalized = normalizeTask(task);
        return {
          ...normalized,
          order: Number.isFinite(normalized.order) ? normalized.order : index
        };
      })
      .sort((a, b) => a.order - b.order);
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await api.post<TaskApiResponse>("/tasks", payload);
    const body = extractTask(response.data);
    return normalizeTask(body ?? payload);
  },

  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const response = await api.put<TaskApiResponse>(`/tasks/${taskId}`, payload);
    const body = extractTask(response.data);
    return normalizeTask({ ...body, id: body?.id ?? taskId });
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  async reorderTasks(payload: ReorderPayload): Promise<void> {
    await api.put("/tasks/reorder", payload);
  }
};
