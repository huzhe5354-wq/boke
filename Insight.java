package com.huzhe.portfolio.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Insight {

    private Long id;

    private String content;

    private String author;

    private String source;

    private Integer sort;

    private Integer status;

    private Date createTime;

    private Date updateTime;
}