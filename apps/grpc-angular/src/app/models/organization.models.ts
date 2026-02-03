/**
 * Represents an employee in the organization.
 * Retrieved from the springbootup REST API.
 */
export interface Employee {
  /** Employee ID */
  id: number;
  /** Employee's first name */
  firstName: string;
  /** Employee's last name */
  lastName: string;
  /** Employee's email address */
  email: string;
  /** Department information (if included) */
  department?: Department;
}

/**
 * Represents a department in the organization.
 * Retrieved from the springbootup REST API.
 */
export interface Department {
  /** Department ID */
  id: number;
  /** Department code (e.g., EQUITY, FIXED, FX) */
  departmentCode: string;
  /** Department name */
  departmentName: string;
  /** Department location */
  location?: string;
  /** Whether the department is active */
  active: boolean;
  /** Department creation date */
  createdDate?: string;
  /** Last modified date */
  modifiedDate?: string;
}

/**
 * Combined view of trader information including both
 * user account data and organizational details.
 */
export interface TraderProfile {
  /** Trading user information */
  name: string;
  /** Account balance */
  balance: number;
  /** Employee details */
  employee?: Employee;
  /** Department details */
  department?: Department;
}
