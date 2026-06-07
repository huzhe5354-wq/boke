package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Insight;
import com.huzhe.portfolio.service.InsightService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insight")
@CrossOrigin
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping("/list")
    public Result<List<Insight>> list() {
        List<Insight> list = insightService.lambdaQuery()
                .orderByAsc(Insight::getSort)
                .list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Insight> getById(@PathVariable Long id) {
        Insight insight = insightService.getById(id);
        if (insight == null) {
            return Result.error("感悟不存在");
        }
        return Result.success(insight);
    }

    @PostMapping("/add")
    public Result<String> add(@RequestBody Insight insight) {
        boolean saved = insightService.save(insight);
        return saved ? Result.success("新增成功") : Result.error("新增失败");
    }

    @PutMapping("/update")
    public Result<String> update(@RequestBody Insight insight) {
        if (insight.getId() == null) {
            return Result.error("感悟 ID 不能为空");
        }
        boolean updated = insightService.updateById(insight);
        return updated ? Result.success("修改成功") : Result.error("修改失败");
    }

    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean removed = insightService.removeById(id);
        return removed ? Result.success("删除成功") : Result.error("删除失败");
    }
}