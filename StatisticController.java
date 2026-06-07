package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Statistic;
import com.huzhe.portfolio.service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/statistic")
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    @GetMapping("/type/{type}")
    public Result getByType(@PathVariable String type) {
        return Result.success(statisticService.getByType(type));
    }

    @PostMapping("/add")
    public Result add(@RequestBody Statistic statistic) {
        statisticService.save(statistic);
        return Result.success(statistic);
    }

    @PutMapping("/update")
    public Result update(@RequestBody Statistic statistic) {
        statisticService.updateById(statistic);
        return Result.success(statistic);
    }

    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Long id) {
        statisticService.removeById(id);
        return Result.success("删除成功");
    }
}
