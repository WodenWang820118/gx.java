package com.example.demo.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Order(2)
@Slf4j
public class GlobalExceptionAspect {

  private static final String RED = "\u001B[31m";
  private static final String RESET = "\u001B[0m";

  @AfterThrowing(pointcut = "com.example.demo.aspects.CommonPointcuts.serviceLayer()", throwing = "error")
  public void logException(JoinPoint joinPoint, Throwable error) {
    String className = joinPoint.getTarget().getClass().getSimpleName();
    String methodName = joinPoint.getSignature().getName();
    log.error("{}❌ Exception in {}.{}: {} - {}{}",
        RED, className, methodName,
        error.getClass().getSimpleName(),
        error.getMessage(), RESET);
  }
}
