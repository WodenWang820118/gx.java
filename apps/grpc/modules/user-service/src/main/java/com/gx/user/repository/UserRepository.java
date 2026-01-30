package com.gx.user.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.gx.user.entity.User;

@Repository
public interface UserRepository extends CrudRepository<User, Integer> {

}
