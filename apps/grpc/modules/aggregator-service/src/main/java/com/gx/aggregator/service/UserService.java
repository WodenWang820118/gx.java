package com.gx.aggregator.service;

import com.gx.user.UserInformation;
import com.gx.user.UserInformationRequest;
import com.gx.user.UserServiceGrpc;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub;

    public UserInformation getUserInformation(int userId) {
        var request = UserInformationRequest.newBuilder()
                .setUserId(userId)
                .build();
        return this.userServiceBlockingStub.getUserInformation(request);
    }
}
