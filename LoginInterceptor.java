package com.huzhe.portfolio.config;

import com.huzhe.portfolio.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String token = request.getHeader("token");

        if (token == null || JwtUtil.parseToken(token) == null) {
            response.setStatus(401);
            response.getWriter().write("Unauthorized");
            return false;
        }

        return true;
    }
}