package com.huzhe.portfolio.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Carousel {
    private Long id;
    private String title;
    private String imageUrl;
    private Integer sort;
    private Date createTime;
}