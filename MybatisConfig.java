package com.huzhe.portfolio.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.huzhe.portfolio.mapper")
public class MybatisConfig {
}