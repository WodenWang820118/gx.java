package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
@EnableJpaAuditing
public class SpringbootupApplication {

  public static void main(String[] args) {
    SpringApplication.run(SpringbootupApplication.class, args);
  }
}
