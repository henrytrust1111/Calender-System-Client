import { CSS } from "@dnd-kit/utilities";
import { memo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { Task } from "../../types/task.types";
import {
  TaskBody,
  TaskCardWrap,
  TaskColorBar,
  TaskDeleteButton,
  TaskTitle
} from "../../styles/calendar.styles";
import { TaskInput } from "./TaskInput";

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  dragDisabled?: boolean;
}

const TaskCardComponent = ({
  task,
  onUpdateTask,
  onDeleteTask,
  dragDisabled = false
}: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    disabled: dragDisabled || isEditing,
    data: {
      type: "task",
      date: task.date
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <TaskCardWrap
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      $dragDisabled={isEditing || dragDisabled}
      {...attributes}
      {...(!isEditing && !dragDisabled ? listeners : {})}
    >
      <TaskColorBar $color={task.color} />
      <TaskBody>
        {isEditing ? (
          <TaskInput
            initialValue={task.title}
            placeholder="Edit task title"
            onSubmit={(value) => {
              onUpdateTask(task.id, value);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            onBackspaceEmpty={() => onDeleteTask(task.id)}
          />
        ) : (
          <>
            <TaskTitle type="button" onClick={() => setIsEditing(true)}>
              {task.title}
            </TaskTitle>
            <TaskDeleteButton
              type="button"
              aria-label="Delete task"
              onClick={() => onDeleteTask(task.id)}
            >
              x
            </TaskDeleteButton>
          </>
        )}
      </TaskBody>
    </TaskCardWrap>
  );
};

export const TaskCard = memo(
  TaskCardComponent,
  (prev, next) =>
    prev.dragDisabled === next.dragDisabled &&
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.date === next.task.date &&
    prev.task.order === next.task.order &&
    prev.task.color === next.task.color
);
