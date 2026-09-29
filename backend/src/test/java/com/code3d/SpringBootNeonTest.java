package com.code3d;

import com.code3d.config.EnvLoader;
import com.code3d.entity.UserRecord;
import com.code3d.repository.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SpringBootNeonTest {

    @BeforeAll
    public static void setup() {
        EnvLoader.load();
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testContextLoads() {
        assertNotNull(userRepository);
        System.out.println("User repository count: " + userRepository.count());
    }
}
