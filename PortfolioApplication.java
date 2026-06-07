package com.huzhe.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PortfolioApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                PortfolioApplication.class,
                args
        );

        System.out.println(
                "==================================="
        );

        System.out.println(
                "  Glass Portfolio Started"
        );

        System.out.println(
                "  http://localhost:8080"
        );

        System.out.println(
                "==================================="
        );
    }
}