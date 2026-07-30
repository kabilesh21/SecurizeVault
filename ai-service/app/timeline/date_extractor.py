import re
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

# Match regex patterns
DATE_PATTERN_YMD = re.compile(r'\b(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b')
DATE_PATTERN_MY = re.compile(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s]+(19|20)\d{2}\b', re.IGNORECASE)
DATE_PATTERN_YM = re.compile(r'\b(19|20)\d{2}[-/](0[1-9]|1[0-2])\b')
DATE_PATTERN_YEAR = re.compile(r'\b(19|20)\d{2}\b')
DATE_PATTERN_ACADEMIC = re.compile(r'\b(19|20)\d{2}[-\s/]+(19|20)?\d{2}\b')

MONTH_MAP = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
}

def extract_dates(
    doc_id: int, 
    ocr_text: Optional[str], 
    doc_title: str, 
    uploaded_at: Optional[str],
    entities: List[Dict[str, Any]]
) -> Tuple[Optional[str], Optional[str], str, str]:
    """
    Returns:
        Tuple[startDate, endDate, datePrecision, dateSource]
    """
    # 1. Look for explicit Date entities connected to this document
    doc_dates = [e for e in entities if e.get("documentId") == doc_id and e.get("type") in ("DATE", "YEAR")]
    
    if doc_dates:
        # Try to parse the first date value
        val = doc_dates[0].get("value", "")
        parsed = try_parse_date_string(val)
        if parsed:
            return parsed[0], parsed[1], parsed[2], "DOCUMENT_CONTENT"

    # 2. Extract from Document Title
    parsed_title = search_text_for_date(doc_title)
    if parsed_title:
        return parsed_title[0], parsed_title[1], parsed_title[2], "DOCUMENT_TITLE"

    # 3. Extract from OCR Text Content
    if ocr_text:
        parsed_content = search_text_for_date(ocr_text)
        if parsed_content:
            return parsed_content[0], parsed_content[1], parsed_content[2], "DOCUMENT_CONTENT"

    # 4. Fallback to upload date
    if uploaded_at:
        try:
            # Parse ISO-8601 string or similar
            iso_date = uploaded_at.split('T')[0]
            # Verify it's a valid date string
            datetime.strptime(iso_date, "%Y-%m-%d")
            return iso_date, None, "DAY", "UPLOAD_DATE_FALLBACK"
        except Exception:
            pass

    return None, None, "UNKNOWN", "UNKNOWN"

def search_text_for_date(text: str) -> Optional[Tuple[Optional[str], Optional[str], str]]:
    # Search patterns sequentially in text
    
    # 1. YYYY-MM-DD
    match = DATE_PATTERN_YMD.search(text)
    if match:
        matched_str = match.group(0).replace('/', '-')
        return matched_str, None, "DAY"
        
    # 2. Academic Year range: e.g. 2024-2025 or 2024-25
    match = DATE_PATTERN_ACADEMIC.search(text)
    if match:
        matched_str = match.group(0)
        parts = re.split(r'[-\s/]+', matched_str)
        if len(parts) == 2:
            start_yr = parts[0]
            end_yr = parts[1]
            if len(end_yr) == 2:
                end_yr = start_yr[:2] + end_yr
            return f"{start_yr}-09-01", f"{end_yr}-06-01", "ACADEMIC_YEAR"

    # 3. Month Year: e.g. July 2026
    match = DATE_PATTERN_MY.search(text)
    if match:
        matched_str = match.group(0)
        tokens = re.split(r'[-\s/]+', matched_str)
        if len(tokens) == 2:
            month_str = tokens[0][:3].lower()
            year_str = tokens[1]
            month = MONTH_MAP.get(month_str, 1)
            return f"{year_str}-{month:02d}-01", None, "MONTH"

    # 4. YYYY-MM
    match = DATE_PATTERN_YM.search(text)
    if match:
        matched_str = match.group(0).replace('/', '-')
        return f"{matched_str}-01", None, "MONTH"

    # 5. Year: e.g. 2026
    match = DATE_PATTERN_YEAR.search(text)
    if match:
        matched_str = match.group(0)
        return f"{matched_str}-01-01", None, "YEAR"

    return None

def try_parse_date_string(val: str) -> Optional[Tuple[Optional[str], Optional[str], str]]:
    val_clean = val.strip()
    
    # Check exact date match (YYYY-MM-DD)
    if re.match(r'^\d{4}-\d{2}-\d{2}$', val_clean):
        return val_clean, None, "DAY"
        
    # Check YYYY-MM
    if re.match(r'^\d{4}-\d{2}$', val_clean):
        return f"{val_clean}-01", None, "MONTH"
        
    # Check YYYY
    if re.match(r'^\d{4}$', val_clean):
        return f"{val_clean}-01-01", None, "YEAR"

    # Fall back to regex searches
    return search_text_for_date(val_clean)
