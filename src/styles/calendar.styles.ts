import styled, { createGlobalStyle } from "styled-components";

export const theme = {
  colors: {
    background: "#f4f5f8",
    panel: "#ffffff",
    text: "#1f2937",
    textMuted: "#6b7280",
    border: "#d7dce3",
    borderSoft: "#e7ebf0",
    holiday: "#d9480f",
    holidayBg: "#fff1e8",
    primary: "#0055cc",
    primarySoft: "#e8f1ff",
    success: "#1f845a",
    danger: "#b42318",
    cardTop: "#36b37e"
  },
  radius: {
    md: "10px",
    lg: "14px"
  }
};

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Segoe UI", "Helvetica Neue", sans-serif;
    background: radial-gradient(circle at 20% -10%, #f9fbff 0%, ${({ theme }) => theme.colors.background} 45%);
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const AppShell = styled.main`
  max-width: 1300px;
  margin: 24px auto;
  padding: 0 16px 32px;
`;

export const CalendarPanel = styled.section`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.borderSoft};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.07);
  overflow: hidden;
`;

export const Header = styled.header`
  padding: 16px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 750px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 650;
`;

export const IconButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SearchInput = styled.input`
  width: 280px;
  max-width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.92rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 85, 204, 0.12);
  }

  @media (max-width: 750px) {
    width: 100%;
  }
`;

export const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};

  @media (max-width: 750px) {
    display: none;
  }
`;

export const WeekdayCell = styled.div`
  padding: 10px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textMuted};
  border-right: 1px solid ${({ theme }) => theme.colors.borderSoft};
  font-weight: 600;
  text-align: center;

  &:last-child {
    border-right: none;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));

  @media (max-width: 750px) {
    grid-template-columns: 1fr;
  }
`;

export const DayCellWrap = styled.article<{ $isCurrentMonth: boolean; $isOver: boolean }>`
  min-height: 145px;
  padding: 8px;
  border-right: 1px solid ${({ theme }) => theme.colors.borderSoft};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
  background: ${({ $isCurrentMonth }) => ($isCurrentMonth ? "#fff" : "#f8f9fb")};
  opacity: ${({ $isCurrentMonth }) => ($isCurrentMonth ? 1 : 0.68)};
  transition: background-color 140ms ease, box-shadow 140ms ease;
  box-shadow: ${({ $isOver }) => ($isOver ? "inset 0 0 0 2px rgba(0,85,204,.25)" : "none")};

  @media (max-width: 950px) {
    min-height: 120px;
  }

  @media (max-width: 750px) {
    min-height: auto;
    border-right: none;
  }
`;

export const DayTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

export const DayNumber = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const HolidayLabel = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.holiday};
  background: ${({ theme }) => theme.colors.holidayBg};
  border: 1px solid #ffd8c2;
  border-radius: 7px;
  padding: 3px 6px;
  margin-bottom: 7px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TaskList = styled.div`
  display: grid;
  gap: 6px;
`;

export const TaskCardWrap = styled.div<{ $isDragging: boolean; $dragDisabled: boolean }>`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  cursor: ${({ $dragDisabled }) => ($dragDisabled ? "text" : "grab")};
  box-shadow: ${({ $isDragging }) =>
    $isDragging ? "0 8px 16px rgba(17, 24, 39, 0.16)" : "0 2px 8px rgba(17, 24, 39, 0.06)"};
  transition: box-shadow 160ms ease, transform 160ms ease;
  will-change: transform;
`;

export const TaskColorBar = styled.div<{ $color?: string }>`
  height: 4px;
  background: ${({ $color, theme }) => $color ?? theme.colors.cardTop};
`;

export const TaskBody = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
`;

export const TaskTitle = styled.button`
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  cursor: text;
  padding: 0;
`;

export const TaskDeleteButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font-size: 0.85rem;
  width: 22px;
  height: 22px;
  border-radius: 6px;

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    background: #fef3f2;
  }
`;

export const InlineInput = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 7px 8px;
  font-size: 0.84rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 85, 204, 0.12);
  }
`;

export const AddTaskButton = styled.button`
  width: 100%;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: #fff;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;
  text-align: left;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 130ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const MessageBar = styled.div<{ $variant?: "error" | "info" }>`
  margin: 10px 16px 0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.84rem;
  color: ${({ $variant, theme }) =>
    $variant === "error" ? theme.colors.danger : theme.colors.textMuted};
  background: ${({ $variant }) => ($variant === "error" ? "#fef3f2" : "#f6f8fb")};
  border: 1px solid ${({ $variant }) => ($variant === "error" ? "#fecaca" : "#e4e7ec")};
`;

export const StatusText = styled.p`
  margin: 12px 16px 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const SkeletonTask = styled.div`
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eef2f7 25%, #e7ebf1 38%, #eef2f7 63%);
  background-size: 400% 100%;
  animation: shimmer 1.1s infinite;

  @keyframes shimmer {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: 0 0;
    }
  }
`;
