package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Message;
import com.huzhe.portfolio.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/message")
@CrossOrigin
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 获取最新留言列表
     */
    @GetMapping("/list")
    public Result<List<Message>> list() {
        List<Message> list = messageService.lambdaQuery()
                .orderByDesc(Message::getCreateTime)
                .list();
        return Result.success(list);
    }

    /**
     * 新增留言
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody Message message) {
        boolean saved = messageService.save(message);
        return saved ? Result.success("留言发表成功") : Result.error("留言失败，请稍后重试");
    }
}
