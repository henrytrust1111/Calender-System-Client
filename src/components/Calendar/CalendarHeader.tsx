import { ChangeEvent, memo } from "react";
import {
  Header,
  HeaderActions,
  HeaderTitle,
  IconButton,
  SearchInput
} from "../../styles/calendar.styles";

interface CalendarHeaderProps {
  monthTitle: string;
  searchQuery: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSearchChange: (value: string) => void;
}

const CalendarHeaderComponent = ({
  monthTitle,
  searchQuery,
  onPreviousMonth,
  onNextMonth,
  onSearchChange
}: CalendarHeaderProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <Header>
      <HeaderActions>
        <IconButton type="button" onClick={onPreviousMonth} aria-label="Previous month">
          {"<"}
        </IconButton>
        <HeaderTitle>{monthTitle}</HeaderTitle>
        <IconButton type="button" onClick={onNextMonth} aria-label="Next month">
          {">"}
        </IconButton>
      </HeaderActions>
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search tasks..."
        aria-label="Search tasks"
      />
    </Header>
  );
};

export const CalendarHeader = memo(CalendarHeaderComponent);
