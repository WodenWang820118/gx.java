package com.example.demo.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Order(1) // Highest priority
@Slf4j
public class GlobalMonitoringAspect {

  private static final String CYAN = "\u001B[36m";
  private static final String GREEN = "\u001B[32m";
  private static final String RED = "\u001B[31m";
  private static final String RESET = "\u001B[0m";

  @Around("com.example.demo.aspects.CommonPointcuts.serviceLayer()")
  public Object monitorServicePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
    long startTime = System.currentTimeMillis();
    String methodName = joinPoint.getSignature().getName();
    String className = joinPoint.getTarget().getClass().getSimpleName();

    try {
      log.info("{}⇒ Executing {}.{}(){}",
          CYAN, className, methodName, RESET);

      Object result = joinPoint.proceed();

      long duration = System.currentTimeMillis() - startTime;
      log.info("{}✓ {}.{} completed in {}ms{}",
          GREEN, className, methodName, duration, RESET);

      return result;
    } catch (Throwable e) {
      log.error("{}✗ {}.{} failed in {}ms{}",
          RED, className, methodName,
          (System.currentTimeMillis() - startTime), RESET);
      throw e;
    }
  }
}
