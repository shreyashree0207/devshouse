import os
import json
import urllib.request
import urllib.parse

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vzwavojjissjbxfaqkeg.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A")

class _Response:
    def __init__(self, data):
        self.data = data

class _QueryBuilder:
    def __init__(self, table_name):
        self.table_name = table_name
        self._action = None
        self._data = None
        self._select_cols = "*"
        self._eqs = []

    def select(self, cols="*"):
        self._action = 'select'
        self._select_cols = cols
        return self

    def eq(self, col, val):
        self._eqs.append((col, f"eq.{val}"))
        return self

    def ilike(self, col, val):
        self._eqs.append((col, f"ilike.{val}"))
        return self

    def order(self, col, desc=False):
        dir_str = "desc" if desc else "asc"
        self._eqs.append(("order", f"{col}.{dir_str}"))
        return self

    def limit(self, count):
        self._eqs.append(("limit", str(count)))
        return self

    def insert(self, data):
        self._action = 'insert'
        self._data = data
        return self

    def execute(self):
        url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        
        if self._action == 'select':
            params = [("select", self._select_cols)] + self._eqs
            query_string = urllib.parse.urlencode(params)
            if query_string:
                url += "?" + query_string
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as response:
                return _Response(json.loads(response.read().decode()))
                
        elif self._action == 'insert':
            headers["Content-Type"] = "application/json"
            headers["Prefer"] = "return=representation"
            data_bytes = json.dumps(self._data).encode("utf-8")
            req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
            with urllib.request.urlopen(req) as response:
                return _Response(json.loads(response.read().decode()))

class _SupabaseClient:
    def table(self, table_name):
        return _QueryBuilder(table_name)

supabase = _SupabaseClient()
def create_client(url, key):
    return supabase
