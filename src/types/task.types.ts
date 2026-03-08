export interface Task {
  id: string;
  title: string;
  date: string;
  order: number;
  color?: string;
}

export interface CreateTaskPayload {
  title: string;
  date: string;
}

export interface UpdateTaskPayload {
  title?: string;
  date?: string;
  order?: number;
}

export interface ReorderTaskItem {
  id: string;
  order: number;
}

export interface ReorderPayload {
  tasks: ReorderTaskItem[];
}
