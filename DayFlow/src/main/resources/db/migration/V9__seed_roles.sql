-- V9: Seed roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN',    'System administrator with full access'),
    ('EMPLOYEE', 'Regular employee with limited access')
ON CONFLICT (name) DO NOTHING;
