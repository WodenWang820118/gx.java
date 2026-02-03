-- Sample departments that make sense for a trading company
INSERT INTO department (department_code, department_name, location, active) VALUES
('EQUITY', 'Equity Trading', 'New York', true),
('FIXED', 'Fixed Income', 'London', true),
('FX', 'Foreign Exchange', 'Singapore', true);

-- Sample employees who are traders
INSERT INTO employee (first_name, last_name, email, department_id) VALUES
('Sam', 'Johnson', 'sam.johnson@tradingco.com', 1),
('Mike', 'Williams', 'mike.williams@tradingco.com', 2),
('John', 'Davis', 'john.davis@tradingco.com', 1);
