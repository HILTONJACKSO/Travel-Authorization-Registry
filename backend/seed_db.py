import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Role, CustomUser
from workflow.models import WorkflowStep

def seed():
    # Roles
    roles_list = ['Admin', 'Staff', 'Director', 'Deputy Minister', 'Minister']
    role_objs = {}
    for name in roles_list:
        role, _ = Role.objects.get_or_create(name=name)
        role_objs[name] = role
        print(f"Role {name} ensured.")

    # Admin User
    admin_email = 'admin@ministry.gov'
    if not CustomUser.objects.filter(email=admin_email).exists():
        admin = CustomUser.objects.create_superuser(
            username='admin',
            email=admin_email,
            password='Password@pos1',
            role=role_objs['Admin']
        )
        print(f"Admin user {admin_email} created.")

    # Staff User
    staff_email = 'staff@ministry.gov'
    if not CustomUser.objects.filter(email=staff_email).exists():
        staff = CustomUser.objects.create_user(
            username='staff',
            email=staff_email,
            password='Password@pos1',
            role=role_objs['Staff']
        )
        print(f"Staff user {staff_email} created.")

    # Workflow Steps
    steps = [
        (1, 'Director'),
        (2, 'Deputy Minister'),
        (3, 'Minister'),
    ]
    for order, role_name in steps:
        WorkflowStep.objects.get_or_create(
            step_order=order,
            role_required=role_objs[role_name]
        )
        print(f"Workflow step {order} ({role_name}) ensured.")

if __name__ == '__main__':
    seed()
