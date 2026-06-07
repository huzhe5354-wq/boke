package com.huzhe.portfolio.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Music {

    private Long id;

    private String title;

    private String artist;

    private String url;

    private String cover;

    private Integer duration;

    private Integer sort;

    private Integer status;

    private Date createTime;

    private Date updateTime;
}