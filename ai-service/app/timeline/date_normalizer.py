from typing import Optional

MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

def normalize_display_date(
    start_date: Optional[str], 
    end_date: Optional[str], 
    precision: str
) -> str:
    """
    Constructs a readable display date.
    """
    if precision == "UNKNOWN" or not start_date:
        return "Unknown Date"

    try:
        parts = start_date.split('-')
        year = int(parts[0])
        month = int(parts[1])
        day = int(parts[2])

        if precision == "DAY":
            month_name = MONTH_NAMES[month]
            return f"{month_name} {day}, {year}"
        
        elif precision == "MONTH":
            month_name = MONTH_NAMES[month]
            return f"{month_name} {year}"
            
        elif precision == "YEAR":
            return str(year)
            
        elif precision == "ACADEMIC_YEAR":
            if end_date:
                end_year = end_date.split('-')[0]
                return f"{year}–{end_year}"
            return f"{year}–{year + 1}"
            
        elif precision == "RANGE" or end_date:
            # Format range
            end_parts = end_date.split('-')
            eyear = int(end_parts[0])
            emonth = int(end_parts[1])
            eday = int(end_parts[2])
            
            s_name = f"{MONTH_NAMES[month]} {year}"
            e_name = f"{MONTH_NAMES[emonth]} {eyear}"
            
            if year == eyear and month == emonth:
                return s_name
            return f"{s_name} – {e_name}"
            
    except Exception:
        pass

    return start_date
