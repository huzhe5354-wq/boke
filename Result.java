package com.huzhe.portfolio.common;

import java.io.Serializable;

/**
 * 全局统一返回结果包装类
 * (纯标准Java实现，不依赖Lombok插件，保证100%完美编译)
 */
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private int code;
    private String msg;
    private T data;

    // 私有构造器，限制外部直接 new，只能通过静态工厂方法创建
    private Result(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    /**
     * 成功返回 (无携带数据)
     */
    public static <T> Result<T> success() {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMsg(), null);
    }

    /**
     * 成功返回 (携带数据)
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMsg(), data);
    }

    /**
     * 默认失败返回 (自定义错误提示)
     */
    public static <T> Result<T> error(String msg) {
        return new Result<>(ResultCode.ERROR.getCode(), msg, null);
    }

    /**
     * 失败返回 (使用标准状态码枚举)
     */
    public static <T> Result<T> error(ResultCode resultCode) {
        return new Result<>(resultCode.getCode(), resultCode.getMsg(), null);
    }

    /**
     * 失败返回 (使用标准状态码枚举 + 自定义错误提示)
     */
    public static <T> Result<T> error(ResultCode resultCode, String customMsg) {
        return new Result<>(resultCode.getCode(), customMsg, null);
    }

    // =========================================================================
    // 标准 Getter 和 Setter 方法 (手写实现，防范IDEA未配置Lombok导致项目编译报错)
    // =========================================================================

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}