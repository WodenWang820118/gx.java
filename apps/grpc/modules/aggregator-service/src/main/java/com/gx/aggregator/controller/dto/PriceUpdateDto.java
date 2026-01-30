package com.gx.aggregator.controller.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PriceUpdateDto {
    private String ticker;
    private Integer price;
}
