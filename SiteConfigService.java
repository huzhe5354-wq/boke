package com.huzhe.portfolio.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.huzhe.portfolio.entity.SiteConfig;

import java.util.Map;

public interface SiteConfigService extends IService<SiteConfig> {
    void saveConfigs(Map<String, String> configs);
    Map<String, String> getAllConfigs();
}
