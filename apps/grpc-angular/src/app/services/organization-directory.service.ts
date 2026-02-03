import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { Department, Employee } from '../models/organization.models';
import { DepartmentService } from './department.service';
import { EmployeeService } from './employee.service';

@Injectable({ providedIn: 'root' })
export class OrganizationDirectoryService {
  private readonly employees = new Map<number, Observable<Employee>>();
  private readonly departments = new Map<number, Observable<Department>>();

  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);

  employeeById(id: number): Observable<Employee> {
    const cached = this.employees.get(id);
    if (cached) return cached;

    const request$ = this.employeeService
      .getEmployeeById(id)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.employees.set(id, request$);
    return request$;
  }

  departmentById(id: number): Observable<Department> {
    const cached = this.departments.get(id);
    if (cached) return cached;

    const request$ = this.departmentService
      .getDepartmentById(id)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.departments.set(id, request$);
    return request$;
  }
}
