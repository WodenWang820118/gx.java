package com.example.demo.aspect;

import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Component
public class CommonPointcuts {

  // Service layer pointcuts
  @Pointcut("execution(* com.example.demo.services..*.*(..))")
  public void serviceLayer() {
  }

  // Repository layer pointcuts
  @Pointcut("execution(* com.example.demo.repositories..*.*(..))")
  public void repositoryLayer() {
  }

  // Write operations pointcuts
  @Pointcut("execution(* com.example.demo.services..*.save*(..)) || " +
      "execution(* com.example.demo.services..*.update*(..)) || " +
      "execution(* com.example.demo.services..*.delete*(..))")
  public void writeOperations() {
  }

  // Read operations pointcuts
  @Pointcut("execution(* com.example.demo.services..*.get*(..)) || " +
      "execution(* com.example.demo.services..*.find*(..))")
  public void readOperations() {
  }
}
