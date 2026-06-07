package com.huzhe.portfolio.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Message {

    private Long id;

    private String username;

    private String email;

    private String content;

    private Date createTime;
}