package com.example.demo.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The goal of ModelMapper is to make object mapping easy, by automatically
 * determining how one object model maps to another, based on conventions, in
 * the same way that a human would - while providing a simple, refactoring-safe
 * API for handling specific use cases.
 * {@link https://modelmapper.org/}
 */
@Configuration
public class ModelMapperConfig {
  @Bean
  public ModelMapper modelMapper() {
    return new ModelMapper();
  }
}
