from database import supabase
import datetime

MOCK_NGOS = {
  'shiksha-foundation': {
    'name': 'Shiksha Foundation',
    'darpan_id': 'MH/2018/0187432',
    'category': 'Education',
    'city': 'Chennai',
    'district': 'Chennai',
    'verified': True,
    'status': 'approved',
    'description': 'Empowering underprivileged children across Tamil Nadu melalui quality education.',
    'goal_amount': 500000,
    'raised_amount': 150000,
    'donor_count': 45,
    'beneficiaries': 200,
    'transparency_score': 87,
  },
  'pragati-path': {
    'name': 'Pragati Path',
    'darpan_id': 'DL/2019/0234521',
    'category': 'Education',
    'city': 'Mumbai',
    'district': 'Mumbai',
    'verified': True,
    'status': 'approved',
    'description': 'Bridging the digital divide for students in rural Maharashtra.',
    'goal_amount': 400000,
    'raised_amount': 95000,
    'donor_count': 22,
    'beneficiaries': 100,
    'transparency_score': 72,
  },
  'annamayya-trust': {
    'name': 'Annamayya Trust',
    'darpan_id': 'TN/2017/0156789',
    'category': 'Food/Hunger',
    'city': 'Delhi',
    'district': 'Delhi',
    'verified': True,
    'status': 'approved',
    'description': 'Running community kitchens and monthly ration drives.',
    'goal_amount': 800000,
    'raised_amount': 450000,
    'donor_count': 120,
    'beneficiaries': 500,
    'transparency_score': 91,
  },
  'nourish-the-nation': {
    'name': 'Nourish The Nation',
    'darpan_id': 'KA/2020/0298341',
    'category': 'Food/Hunger',
    'city': 'Bangalore',
    'district': 'Bangalore',
    'verified': False,
    'status': 'under_review',
    'description': 'Providing monthly ration kits to migrant worker families.',
    'goal_amount': 300000,
    'raised_amount': 80000,
    'donor_count': 18,
    'beneficiaries': 100,
    'transparency_score': 65,
  },
  'aarogya-health-mission': {
    'name': 'Aarogya Health Mission',
    'darpan_id': 'MH/2016/0123456',
    'category': 'Healthcare',
    'city': 'Chennai',
    'district': 'Chennai',
    'verified': True,
    'status': 'approved',
    'description': 'Deploying mobile medical units to rural Tamil Nadu.',
    'goal_amount': 1000000,
    'raised_amount': 380000,
    'donor_count': 89,
    'beneficiaries': 1000,
    'transparency_score': 94,
  },
  'vriksh-protectors': {
    'name': 'Vriksh Protectors',
    'darpan_id': 'DL/2021/0345678',
    'category': 'Environment',
    'city': 'Delhi',
    'district': 'Delhi',
    'verified': False,
    'status': 'under_review',
    'description': 'Planting native saplings in Delhi-NCR degraded land areas.',
    'goal_amount': 200000,
    'raised_amount': 45000,
    'donor_count': 12,
    'beneficiaries': 500,
    'transparency_score': 58,
  },
}

def seed_ngos():
    for slug, data in MOCK_NGOS.items():
        # Check if exists
        res = supabase.table("ngos").select("id").eq("darpan_id", data['darpan_id']).execute()
        if not res.data:
            print(f"Adding {data['name']}...")
            # Use slug as ID for compatibility with frontend code for now
            # though ID is usually UUID, the frontend checks for id as param
            # Wait, better use a UUID but also check if I can use slug as ID in Supabase
            # Actually, the frontend code in ngo-login/page.tsx stores ID in localStorage
            # and uses it in the URL.
            payload = {**data, "id": slug, "created_at": datetime.datetime.utcnow().isoformat()}
            try:
                supabase.table("ngos").insert(payload).execute()
                print(f" - Successfully added {data['name']}")
            except Exception as e:
                print(f" - Error adding {data['name']}: {e}")
        else:
            print(f"{data['name']} already exists.")

if __name__ == "__main__":
    seed_ngos()
