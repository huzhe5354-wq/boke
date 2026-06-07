package com.huzhe.portfolio.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.huzhe.portfolio.entity.Statistic;

import java.util.List;

public interface StatisticService extends IService<Statistic> {
    List<Statistic> getByType(String type);
}
