package com.huzhe.portfolio.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("project")
public class Project {

    private Long id;
    private String title;
    private String description;
    private String image;
    private String github;
    private String demo;

    /**
     * 使用 @TableField 注解将 Java 的驼峰命名映射到数据库的下划线命名
     * 这样可以完美解决 SQL 1054 错误
     */
    @TableField("tech_stack")
    private String techStack;

    private Date createTime;
}