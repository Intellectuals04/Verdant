from pymongo import MongoClient

# ✅ MongoDB Connection
MONGO_URI = "mongodb+srv://verdant:Verdant%40130725@cluster0.jineugw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["test"]  # Your database name
collection = db["auditreports"]

def get_latest_audit_report():
    """Fetch the latest audit report from MongoDB"""
    return collection.find_one(sort=[("_id", -1)])
