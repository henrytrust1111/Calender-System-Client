import axios from "axios";
import { Holiday } from "../types/holiday.types";

const HOLIDAY_API_BASE = "https://date.nager.at/api/v3";

export const holidayService = {
  async getPublicHolidays(year: number, countryCode: string): Promise<Holiday[]> {
    const response = await axios.get<Holiday[]>(
      `${HOLIDAY_API_BASE}/PublicHolidays/${year}/${countryCode}`
    );
    return response.data;
  }
};
