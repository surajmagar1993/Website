export function getCurrentHolidayTheme(date: Date = new Date()): string | null {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  const day = date.getDate();

  // New Year (Jan 1 - Jan 5)
  if (month === 0 && day <= 5) return 'theme-newyear';
  
  // Republic Day (Jan 24 - Jan 28)
  if (month === 0 && day >= 24 && day <= 28) return 'theme-independence';

  // Valentine's Day (Feb 10 - Feb 15)
  if (month === 1 && day >= 10 && day <= 15) return 'theme-valentine';

  // Holi (Roughly Mid-March: Mar 10 - Mar 25)
  if (month === 2 && day >= 10 && day <= 25) return 'theme-holi';

  // Independence Day (Aug 13 - Aug 17)
  if (month === 7 && day >= 13 && day <= 17) return 'theme-independence';

  // Navratri / Dussehra (Roughly Oct 1 - Oct 15)
  if (month === 9 && day >= 1 && day <= 15) return 'theme-navratri';

  // Diwali (Roughly late Oct / early Nov: Oct 25 - Nov 10)
  if ((month === 9 && day >= 25) || (month === 10 && day <= 10)) return 'theme-diwali';

  // Christmas (Dec 20 - Dec 31)
  if (month === 11 && day >= 20) return 'theme-christmas';

  return null; // No active festival
}
