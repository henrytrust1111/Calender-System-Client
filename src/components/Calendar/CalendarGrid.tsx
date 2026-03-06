import { memo } from "react";
import { CalendarDay } from "../../utils/calendarUtils";
import { Holiday } from "../../types/holiday.types";
import { Task } from "../../types/task.types";
import { WEEKDAY_LABELS } from "../../utils/dateUtils";
import {
  DayCellWrap,
  DayNumber,
  DayTop,
  Grid,
  SkeletonTask,
  TaskList,
  WeekdayCell,
  WeekdayRow
} from "../../styles/calendar.styles";
import { DayCell } from "./DayCell";

interface CalendarGridProps {
  days: CalendarDay[];
  tasksByDate: Record<string, Task[]>;
  holidaysByDate: Record<string, Holiday[]>;
  loading: boolean;
  dragDisabled: boolean;
  onCreateTask: (title: string, date: string) => void;
  onUpdateTask: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const CalendarGridComponent = ({
  days,
  tasksByDate,
  holidaysByDate,
  loading,
  dragDisabled,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: CalendarGridProps) => {
  return (
    <>
      <WeekdayRow>
        {WEEKDAY_LABELS.map((label) => (
          <WeekdayCell key={label}>{label}</WeekdayCell>
        ))}
      </WeekdayRow>

      <Grid>
        {days.map((day) => {
          const dayTasks = tasksByDate[day.date] ?? [];

          if (loading) {
            return (
              <DayCellWrap key={day.date} $isCurrentMonth={day.isCurrentMonth} $isOver={false}>
                <DayTop>
                  <DayNumber>{Number(day.date.slice(-2))}</DayNumber>
                </DayTop>
                <TaskList>
                  <SkeletonTask />
                  <SkeletonTask />
                </TaskList>
              </DayCellWrap>
            );
          }

          return (
            <DayCell
              key={day.date}
              day={day}
              tasks={dayTasks}
              holidays={holidaysByDate[day.date] ?? []}
              onCreateTask={onCreateTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              dragDisabled={dragDisabled}
            />
          );
        })}
      </Grid>
    </>
  );
};

export const CalendarGrid = memo(CalendarGridComponent);
