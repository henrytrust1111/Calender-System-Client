import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      panel: string;
      text: string;
      textMuted: string;
      border: string;
      borderSoft: string;
      holiday: string;
      holidayBg: string;
      primary: string;
      primarySoft: string;
      success: string;
      danger: string;
      cardTop: string;
    };
    radius: {
      md: string;
      lg: string;
    };
  }
}
