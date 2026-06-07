package com.huzhe.portfolio.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class JwtUtil {

    // 建议在生产环境下放入 application.yml 统一读取
    // 密钥必须不低于 256 位 (32 字节)，这里定义一个标准的随机密钥
    private static final Key KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    // 过期时间：设置为 2 小时
    private static final long EXPIRE_TIME = 2 * 60 * 60 * 1000;

    /**
     * 生成 Token
     */
    public static String createToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + EXPIRE_TIME))
                .signWith(KEY)
                .compact();
    }

    /**
     * 解析并校验 Token
     */
    public static Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            // 解析失败（过期、篡改、空白等情况均返回 null）
            return null;
        }
    }
}