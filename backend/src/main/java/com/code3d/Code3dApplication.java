package com.code3d;

import com.code3d.config.EnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Code3dApplication {
    public static void main(String[] args) {
        EnvLoader.load();
        SpringApplication.run(Code3dApplication.class, args);
    }
}
