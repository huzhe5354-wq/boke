package com.huzhe.portfolio.exception;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.common.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 捕获所有的运行时异常 (RuntimeException)
     */
    @ExceptionHandler(RuntimeException.class)
    public Result<String> handleRuntimeException(RuntimeException e) {
        log.error("【系统运行时异常检测】：", e);
        return Result.error("服务器开小差了，请稍后再试！具体原因: " + e.getMessage());
    }

    /**
     * 捕获全局兜底的最高级别异常 (Exception)
     */
    @ExceptionHandler(Exception.class)
    public Result<String> handleException(Exception e) {
        log.error("【系统严重异常检测】：", e);
        return Result.error(ResultCode.ERROR, "系统内部发生致命阻断，请联系系统管理员。");
    }
}

