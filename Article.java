package com.huzhe.portfolio.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Article {

    private Long id;

    private String title;

    private String summary;

    private String content;

    private String cover;

    private Integer views;

    private Date createTime;

    private Date updateTime;
}