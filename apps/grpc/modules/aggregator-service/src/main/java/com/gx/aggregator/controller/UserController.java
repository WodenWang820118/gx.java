package com.gx.aggregator.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gx.aggregator.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping(value = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Object getUserInformation(@PathVariable Integer userId) {
        return this.userService.getUserInformation(userId);
    }
}
