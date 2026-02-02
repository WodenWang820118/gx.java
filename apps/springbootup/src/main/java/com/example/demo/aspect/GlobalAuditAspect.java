package com.example.demo.aspect;

import java.util.Arrays;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Order(3)
@Slf4j
public class GlobalAuditAspect {

  private static final String YELLOW = "\u001B[33m";
  private static final String BLUE = "\u001B[34m";
  private static final String RESET = "\u001B[0m";

  @Before("com.example.demo.aspects.CommonPointcuts.writeOperations()")
  public void logWriteOperation(JoinPoint joinPoint) {
    String className = joinPoint.getTarget().getClass().getSimpleName();
    String methodName = joinPoint.getSignature().getName();
    String args = Arrays.toString(joinPoint.getArgs());

    log.info("{}⚡ Write operation: {}.{} with data: {}{}",
        YELLOW, className, methodName, args, RESET);
  }

  @AfterReturning(pointcut = "com.example.demo.aspects.CommonPointcuts.readOperations()", returning = "result")
  public void logReadOperation(JoinPoint joinPoint, Object result) {
    String className = joinPoint.getTarget().getClass().getSimpleName();
    String methodName = joinPoint.getSignature().getName();

    log.info("{}📖 Read operation: {}.{} completed{}",
        BLUE, className, methodName, RESET);
  }
}
