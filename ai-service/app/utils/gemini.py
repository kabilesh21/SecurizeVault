import os
import json
import urllib.request
from typing import Dict, Any, List

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def call_gemini(prompt: str) -> str:
    """
    Calls the Gemini API to generate content using the GEMINI_API_KEY environment variable.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        return "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable in your .env file."
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            
            candidates = res_json.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return "Unable to parse response from Gemini."
            
    except Exception as e:
        return f"Gemini API invocation failed: {str(e)}"
