package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Admin;
import com.huzhe.portfolio.service.AdminService;
import com.huzhe.portfolio.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * 生产级别：基于数据库持久层的高端登录校验
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");

        // 1. 根据用户名从数据库检索管理员实体
        Admin admin = adminService.lambdaQuery()
                .eq(Admin::getUsername, username)
                .one();

        // 2. 校验账号是否存在以及密码是否一致（生产中密码建议做 MD5 或 BCrypt 加密）
        if (admin != null && admin.getPassword().equals(password)) {
            // 3. 生成真实的 JWT Token 并返回
            String token = JwtUtil.createToken(username);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("username", username);

            return Result.success(responseData);
        }

        return Result.error("用户名或密码不正确");
    }
}