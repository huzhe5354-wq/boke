package com.huzhe.portfolio.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("statistic")
public class Statistic {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String type;
    private String dataKey;
    private Double value1;
    private Double value2;
    private Double value3;
    private Integer sort;
    private LocalDateTime createTime;
}
