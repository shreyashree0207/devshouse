import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vzwavojjissjbxfaqkeg.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A")

if SUPABASE_URL != "https://vzwavojjissjbxfaqkeg.supabase.co":
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None
