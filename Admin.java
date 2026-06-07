package com.huzhe.portfolio.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("admin")
public class Admin {

    @TableId
    private Long id;

    private String username;
    private String password;
}