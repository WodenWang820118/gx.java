package com.gx.user.service;

import org.springframework.stereotype.Service;

import com.gx.user.UserInformation;
import com.gx.user.UserInformationRequest;
import com.gx.user.exceptions.UnkownUserException;
import com.gx.user.repository.PortfolioItemRepository;
import com.gx.user.repository.UserRepository;
import com.gx.user.util.EntityMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserInformationRequestHandler {
    private final UserRepository userRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final EntityMapper entityMapper;

    public UserInformation getUserInformation(UserInformationRequest request) {
        var user = this.userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UnkownUserException(request.getUserId()));
        var portfolioItems = this.portfolioItemRepository.findAllByUserId(request.getUserId());
        return this.entityMapper.toUserInformation(user, portfolioItems);
    }
}
