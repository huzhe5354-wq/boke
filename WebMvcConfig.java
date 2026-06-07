package com.huzhe.portfolio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 规范映射静态资源 (JS/CSS)
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        // 2. 将上传的图片等映射到物理路径中，防范404问题
        String userDir = System.getProperty("user.dir");
        String uploadPath = userDir + File.separator + "upload" + File.separator;

        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:" + uploadPath);
    }
}