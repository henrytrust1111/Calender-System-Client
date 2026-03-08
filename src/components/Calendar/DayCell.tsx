import { memo, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarDay } from "../../utils/calendarUtils";
import { Task } from "../../types/task.types";
import { Holiday } from "../../types/holiday.types";
import {
  AddTaskButton,
  DayCellWrap,
  DayNumber,
  DayTop,
  HolidayLabel,
  TaskList
} from "../../styles/calendar.styles";
import { TaskInput } from "../Task/TaskInput";
import { TaskCard } from "../Task/TaskCard";

interface DayCellProps {
  day: CalendarDay;
  tasks: Task[];
  holidays: Holiday[];
  onCreateTask: (title: string, date: string) => void;
  onUpdateTask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
  dragDisabled: boolean;
}

const DayCellComponent = ({
  day,
  tasks,
  holidays,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  dragDisabled
}: DayCellProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const dayTasks = tasks ?? [];

  const { isOver, setNodeRef } = useDroppable({
    id: `Droppable-${day.date}`,
    data: {
      type: "day",
      date: day.date
    }
  });

  const sortableIds = useMemo(() => dayTasks.map((task) => task.id), [dayTasks]);
  const dayNumber = Number(day.date.slice(-2));

  return (
    <DayCellWrap ref={setNodeRef} $isCurrentMonth={day.isCurrentMonth} $isOver={isOver}>
      <DayTop>
        <DayNumber>{dayNumber}</DayNumber>
      </DayTop>

      {holidays.map((holiday) => (
        <HolidayLabel key={`${day.date}-${holiday.name}`}>{holiday.name}</HolidayLabel>
      ))}

      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <TaskList>
          {dayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              dragDisabled={dragDisabled}
            />
          ))}
          {isAddingTask ? (
            <TaskInput
              placeholder="Create task..."
              onSubmit={(value) => {
                onCreateTask(value, day.date);
                setIsAddingTask(false);
              }}
              onCancel={() => setIsAddingTask(false)}
            />
          ) : (
            <AddTaskButton type="button" onClick={() => setIsAddingTask(true)}>
              + Add task
            </AddTaskButton>
          )}
        </TaskList>
      </SortableContext>
    </DayCellWrap>
  );
};

export const DayCell = memo(
  DayCellComponent,
  (prev, next) =>
    prev.day.date === next.day.date &&
    prev.day.isCurrentMonth === next.day.isCurrentMonth &&
    prev.dragDisabled === next.dragDisabled &&
    prev.tasks === next.tasks &&
    prev.holidays === next.holidays
);
