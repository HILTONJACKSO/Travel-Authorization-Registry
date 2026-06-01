import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from documents.models import Document
from workflow.models import WorkflowStep
from audit.models import Notification
from django.db.models import Count

def simulate_report():
    total = Document.objects.count()
    if total == 0:
        return "No documents found."
    
    all_docs = Document.objects.all().select_related('metadata')
    
    dept_map = {}
    status_map = {}
    total_time = 0
    approved_count = 0
    
    for doc in all_docs:
        s = doc.status
        status_map[s] = status_map.get(s, 0) + 1
        
        dept = doc.metadata.department if doc.metadata else 'Uncategorized'
        dept_map[dept] = dept_map.get(dept, 0) + 1
        
        if doc.status == 'Approved':
            approved_count += 1
            total_time += (doc.updated_at - doc.created_at).total_seconds()

    avg_time = (total_time / approved_count / 3600) if approved_count > 0 else 0
    compliance_rate = (status_map.get('Approved', 0) / total * 100) if total > 0 else 0
    
    report = {
        'total': total,
        'avg_time': round(avg_time, 1),
        'compliance_rate': round(compliance_rate, 1),
        'dept_throughput': dept_map,
        'status_breakdown': status_map
    }
    return json.dumps(report, indent=4)

print("--- Simulated Report Output ---")
print(simulate_report())

print("\n--- Recent Notifications ---")
for n in Notification.objects.all()[:5]:
    print(f"To: {n.user.email} | {n.message}")
