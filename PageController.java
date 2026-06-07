package com.huzhe.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 后端页面路由统一控制中心
 * 将旧版散落简陋的 project/article 等路由，高优雅地收拢指向现代化的 Glass Control Hub 大屏
 */
@Controller
public class PageController {

    /**
     * 前台默认登录入口
     */
    @GetMapping("/")
    public String login() {
        return "login";
    }

    /**
     * 前台博客与展示主站
     */
    @GetMapping("/index")
    public String index() {
        return "index";
    }

    /**
     * 后台综合管理大屏 (Glass Control Hub)
     * 将 project、dashboard 等路由全部重定向指向这个全功能高保真玻璃拟态后台大屏
     */
    @GetMapping("/project")
    public String project() {
        return "dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/article")
    public String article() {
        return "dashboard";
    }

    @GetMapping("/message")
    public String message() {
        return "dashboard";
    }
}