import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { CalendarHeader } from "./components/Calendar/CalendarHeader";
import { CalendarGrid } from "./components/Calendar/CalendarGrid";
import { useCalendar } from "./hooks/useCalendar";
import { useHolidays } from "./hooks/useHolidays";
import { useTaskDnD } from "./hooks/useTaskDnD";
import { useTasks } from "./hooks/useTasks";
import { buildTasksByDate } from "./utils/taskUtils";
import {
  AppShell,
  CalendarPanel,
  MessageBar,
  StatusText,
  TaskBody,
  TaskCardWrap,
  TaskColorBar,
  TaskTitle
} from "./styles/calendar.styles";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const { currentMonth, days, monthTitle, goToPreviousMonth, goToNextMonth } = useCalendar();
  const { holidaysByDate, loading: holidayLoading, error: holidayError } = useHolidays(currentMonth);
  const {
    tasks,
    loading: taskLoading,
    saving,
    error: taskError,
    setTasks,
    createTask,
    updateTask,
    deleteTask,
    persistReorder
  } = useTasks(currentMonth);

  const dragDisabled = searchQuery.trim().length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks;
    }
    const query = searchQuery.toLowerCase().trim();
    return tasks.filter((task) => task.title.toLowerCase().includes(query));
  }, [searchQuery, tasks]);

  const tasksByDate = useMemo(() => buildTasksByDate(filteredTasks), [filteredTasks]);

  const { activeTask, onDragStart, onDragOver, onDragCancel, onDragEnd } = useTaskDnD({
    tasks,
    setTasks,
    persistReorder,
    disabled: dragDisabled
  });

  const handleCreateTask = useCallback(
    (title: string, date: string) => {
      void createTask(title, date);
    },
    [createTask]
  );

  const handleUpdateTask = useCallback(
    (taskId: string, title: string) => {
      void updateTask(taskId, title);
    },
    [updateTask]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      void deleteTask(taskId);
    },
    [deleteTask]
  );

  const combinedError = taskError ?? holidayError;
  const isLoading = taskLoading || holidayLoading;

  return (
    <AppShell>
      <CalendarPanel>
        <CalendarHeader
          monthTitle={monthTitle}
          searchQuery={searchQuery}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onSearchChange={setSearchQuery}
        />

        {combinedError ? <MessageBar $variant="error">{combinedError}</MessageBar> : null}
        {dragDisabled ? (
          <MessageBar $variant="info">
            Drag and drop is disabled while searching. Clear search to reorder tasks.
          </MessageBar>
        ) : null}
        {saving ? <StatusText>Saving changes...</StatusText> : null}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <CalendarGrid
            days={days}
            tasksByDate={tasksByDate}
            holidaysByDate={holidaysByDate}
            loading={isLoading}
            dragDisabled={dragDisabled}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />

          <DragOverlay>
            {activeTask ? (
              <TaskCardWrap $isDragging $dragDisabled>
                <TaskColorBar $color={activeTask.color} />
                <TaskBody>
                  <TaskTitle type="button">{activeTask.title}</TaskTitle>
                </TaskBody>
              </TaskCardWrap>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CalendarPanel>
    </AppShell>
  );
}

export default App;
