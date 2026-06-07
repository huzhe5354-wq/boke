package com.huzhe.portfolio.common;

/**
 * 统一响应状态码枚举类
 */
public enum ResultCode {
    SUCCESS(200, "操作成功"),
    ERROR(500, "系统未知错误"),
    VALIDATE_FAILED(400, "参数检验失败"),
    UNAUTHORIZED(401, "暂未登录或Token已过期"),
    FORBIDDEN(403, "没有相关权限");

    private final int code;
    private final String msg;

    ResultCode(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
}