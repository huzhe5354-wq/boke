package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/site/config")
public class SiteConfigController {

    @Autowired
    private SiteConfigService siteConfigService;

    @GetMapping("/all")
    public Result getAllConfigs() {
        return Result.success(siteConfigService.getAllConfigs());
    }

    @PostMapping("/save")
    public Result saveConfigs(@RequestBody Map<String, String> configs) {
        siteConfigService.saveConfigs(configs);
        return Result.success("保存成功");
    }
}
