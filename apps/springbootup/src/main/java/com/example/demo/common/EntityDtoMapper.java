package com.example.demo.common;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.stereotype.Component;

@Component
public class EntityDtoMapper {
  private final ModelMapper modelMapper;

  public EntityDtoMapper() {
    this.modelMapper = new ModelMapper();
    configureMapper();
  }

  private void configureMapper() {
    modelMapper.getConfiguration()
        .setMatchingStrategy(MatchingStrategies.STRICT)
        .setPropertyCondition(Conditions.isNotNull());
  }

  public <D, T> D convertToDto(T entity, Class<D> dtoClass) {
    return modelMapper.map(entity, dtoClass);
  }

  public <D, T> T convertToEntity(D dto, Class<T> entityClass) {
    return modelMapper.map(dto, entityClass);
  }
}
